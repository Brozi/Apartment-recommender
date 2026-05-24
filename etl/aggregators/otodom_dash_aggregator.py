from .otodom_aggregator import OtodomAggregator
from pymongo import UpdateOne
import logging

from etl.common import NOW

logger = logging.getLogger(__name__)

class OtodomDashAggregator(OtodomAggregator):
    def __init__(self, listings_col = 'listings_clean', dashboard_col = 'dashboard_aggregates'):
        super().__init__()
        self.listings_col = self.db[listings_col]
        self.dashboard_aggregates_col = self.db[dashboard_col]
        self.period = {
            '$dateToString': {
                'format': '%Y-%m',
                'date': '$scraped_at',
            }

        }
        self.mode = [
        {
            '$group': {
                '_id': '$rooms',
                'frequency': { '$count': {} }
            }
        },
        {
            '$sort': { 'frequency': -1 }
        },
        {
            '$group': {
                '_id': None,
                'maxFrequency': { '$first': '$frequency' },
                'allCounts': {
                    '$push': { 'value': '$_id', 'frequency': '$frequency' }
                }
            }
        },
        {
            '$project': {
                '_id': 0,
                'highestFrequency': '$maxFrequency',
                'modes': {
                    '$map': {
                        'input': {
                            '$filter': {
                                'input': '$allCounts',
                                'as': 'item',
                                'cond': { '$eq': ['$$item.frequency', '$maxFrequency'] }
                            }
                        },
                        'as': 'modeItem',
                        'in': '$$modeItem.value'
                    }
                }
            }
        }
    ]


    def build_dash_aggregates(self):
        metrics = {
            'offer_count_by_construction_status': self._count_by_basic_field_pipeline(self.construction_status),
            'offer_count_by_rooms': self._count_by_basic_field_pipeline(self.rooms),
            'offer_count_by_build_year': self._count_by_build_year_range_pipeline(),
            'offer_count_by_market_type': self._count_by_basic_field_pipeline(self.market_type),
            'monthly_area_stats': self._monthly_area_stats_pipeline(),
            'monthly_price_stats': self._monthly_price_stats_pipeline(),
            'monthly_price_per_meter_stats': self._monthly_price_per_meter_stats_pipeline(),
            'monthly_market_by_district': self._monthly_market_by_district_pipeline(),

        }

        total_updated = 0

        for metric_name, pipeline in metrics.items():
            rows = list(self.listings_col.aggregate(pipeline, allowDiskUse=True))
            total_updated += self._save_dashboard_metric(metric_name, rows)

        logger.info(f'Total updated count: {total_updated}')
        return total_updated


    def _save_dashboard_metric(self, metric_name, rows):
        operations = []

        for row in rows:
            group_key = row['_id']
            key = '|'.join(f'{k}={v}' for k, v in sorted(group_key.items()))

            values = {
                k: v
                for k, v in row.items()
                if k!='_id'
            }

            operations.append(UpdateOne(
                {
                    'metric': metric_name,
                    'key': key,
                },
                {
                    '$set': {
                        'metric': metric_name,
                        'key': key,
                        'group_key':group_key,
                        'values': values,
                        'computed_at': NOW
                    }
                },
                upsert=True
            )
        )

        if operations:
            self.dashboard_aggregates_col.bulk_write(operations)

        return len(operations)

    @staticmethod
    def _count_by_basic_field_pipeline(field:str):
        output_key = field.replace('.', '_')
        return [
            {
                '$group': {
                    '_id': {
                        output_key: {'$ifNull': [f'${field}', 'unknown']}
                    },
                    'count': {'$sum': 1},
                }
            }
        ]

    def _count_by_build_year_range_pipeline(self):
        ranges = [
            {'label': 'before 1945', 'min': 1800, 'max': 1944, 'sort_order': 1},
            {'label': '1945 - 1970', 'min': 1945, 'max': 1970, 'sort_order': 2},
            {'label': '1971 - 1989', 'min': 1971, 'max': 1989, 'sort_order': 3},
            {'label': '1990 - 2000', 'min': 1990, 'max': 2000, 'sort_order': 4},
            {'label': '2001 - 2010', 'min': 2001, 'max': 2010, 'sort_order': 5},
            {'label': '2011 - 2020', 'min': 2011, 'max': 2020, 'sort_order': 6},
            {'label': '2021+', 'min': 2021, 'max': None, 'sort_order': 7},
        ]

        def build_branch(item):
            conditions = [
                {'$gte': ['$build_year_int', item['min']]},
                #greater than or equal
            ]

            if item['max'] is not None:
                conditions.append({'$lte': ['build_year_int', item['max']]})

            return {
                'case': {'$and': conditions},
                'then': {
                    'label': item['label'],
                    'sort_order': item['sort_order'],
                }
            }

        return [
            {

                '$project': {
                    'build_year_int': {
                        '$convert': {
                            'input': f'${self.build_year}',
                            'to': 'int',
                            'onError': None,
                            'onNull': None,
                        }
                    }
                }

            },
            {
                '$project': {
                    'build_year_bucket': {
                        '$switch': {
                            'branches': [build_branch(item) for item in ranges],
                            'default': {
                                'label': 'unknown',
                                'sort_order': 99,
                            },
                        }
                    }
                }
            },
            {
                '$group': {
                    '_id': {
                        'build_year_range': '$build_year_bucket.label',
                        'sort_order': '$build_year_bucket.sort_order',
                    },
                    'count': {'$sum': 1},
                }
            },
            {
                '$sort':{
                    '_id.sort_order': 1,

                }
            }
        ]



    def _monthly_area_stats_pipeline(self):
        return [
            {
                '$match': {
                    'scraped_at': {
                        '$ne': None
                    }
                }
            },
            {
                '$group': {
                    '_id': {'period': self.period},
                    'avg_area': {'$avg': '$area'},
                    'med_area': {
                        '$median': {
                            'input': '$area',
                            'method': 'approximate',
                        }
                    },
                    'count': {'$sum': 1},
                }

            },
            {
                '$project': {
                    'avg_area': {'$round': ['$avg_area', 2]},
                    'med_area': {'$round': ['$med_area', 2]},
                    'count': 1,
                }
            }
        ]

    def _monthly_price_stats_pipeline(self):
        return [
            {
                '$match': {
                    'scraped_at': {
                        '$ne': None
                    },
                    'price_usable': True,
                }

            },
            {
                '$group': {
                    '_id': {
                        'period': self.period,
                        'auction_type': f'${self.auction_type}'
                    },
                    'avg_price':{'$avg': '$price'},
                    'med_price': {
                        '$median': {
                            'input': '$price',
                            'method': 'approximate',

                        }
                    },
                    'count': {'$sum': 1},

                }
            },
            {
                '$project': {
                    'avg_price': {'$round': ['$avg_price', 2]},
                    'med_price': {'$round': ['$med_price', 2]},
                    'count': 1,
                }
            }
        ]

    def _monthly_price_per_meter_stats_pipeline(self):
        return [
            {
                '$match': {
                    'scraped_at': {
                        '$ne': None
                    },
                    'price_per_meter_usable': True,
                }

            },
            {
                '$group': {
                    '_id': {'period': self.period,},
                    'avg_price_per_meter': {'$avg': '$price_per_meter'},
                    'med_price_per_meter': {
                        '$median': {
                            'input': '$price_per_meter',
                            'method': 'approximate',
                        }
                    },
                    'count': {'$sum': 1},

                }
            },
            {
                '$project': {
                    'avg_price_per_meter': {'$round': ['$avg_price_per_meter', 2]},
                    'med_price_per_meter': {'$round': ['$med_price_per_meter', 2]},
                    'count': 1,
                }
            }
        ]

    def _monthly_market_by_district_pipeline(self):
        return [
            {
                '$match': {
                    'price_usable': True,
                    'price_per_meter_usable': True,

                }
            },
            {
                '$group': {
                    '_id': {
                        'period': self.period,
                        'city': '$localization.city',
                        'district': '$localization.district',
                        'subdistrict': '$localization.neighbourhood',

                    },
                    'avg_price': {'$avg': '$price'},
                    'med_price': {
                        '$median': {
                            'input': '$price',
                            'method': 'approximate',
                        }
                    },
                    'avg_price_per_meter': {'$avg': '$price_per_meter'},
                    'med_price_per_meter': {
                        '$median': {
                            'input': '$price_per_meter',
                            'method': 'approximate',
                        }
                    },
                    'avg_area': {'$avg': '$area'},
                    'med_area': {
                        '$median': {
                            'input': '$area',
                            'method': 'approximate',
                        }
                    },
                    'med_rooms':{
                        '$median': {
                        'input': {
                            '$convert': {
                                'input': "$rooms",
                                'to': "double",
                                'onError': None,
                                'onNull': None
                            }
                        },
                        'method': 'approximate'
                        }

                    },

                    'count': {'$sum': 1}

                }
            },
            {
                '$project': {
                    'avg_price': {'$round': ['$avg_price', 2]},
                    'med_price': {'$round': ['$med_price', 2]},
                    'avg_price_per_meter': {'$round': ['$avg_price_per_meter', 2]},
                    'med_price_per_meter': {'$round': ['$med_price_per_meter', 2]},
                    'avg_area': {'$round': ['$avg_area', 2]},
                    'med_area': {'$round': ['$med_area', 2]},
                    'med_rooms': 1,
                    'count': 1,
                }
            }
        ]
