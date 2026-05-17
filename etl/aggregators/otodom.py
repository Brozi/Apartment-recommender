from datetime import datetime, timezone

from etl.services import connect_to_database

from pymongo import UpdateOne

class OtodomDashAggregator:
    def __init__(self, listings_col='listings_clean', dashboard_col='dashboard_aggregates'):
        self.db = connect_to_database()['otodom_data']
        self.listings_col = self.db[listings_col]
        self.dashboard_aggregates_col = self.db[dashboard_col]

    def build_dash_aggregates(self):
        pipeline = [
            {
                '$match':{
                    'price_usable': True,
                    'price_per_meter_usable': True,

                }
            },
            {
                '$group': {
                    '_id': {
                        'period': {
                            '$dateToString': {
                                'format': '%Y-%m',
                                'date': '$scraped_at',
                            }
                        },
                        'city': '$localization.city',
                        'district': '$localization.district',
                        'subdistrict': '$localization.neighbourhood',

                    },
                    'avg_price': {'$avg': '$price'},
                    'avg_price_per_meter': {'$avg': '$price_per_meter'},
                    'med_price': {
                        '$median': {
                            'input':'$price',
                            'method': 'approximate',
                            }
                    },
                    'med_price_per_meter': {
                        '$median': {
                            'input':'$price_per_meter',
                            'method': 'approximate',
                            }
                    },
                    'count': {'$sum': 1}

                }
            },
        ]

        now = datetime.now(timezone.utc)
        operations = []

        for row in self.listings_col.aggregate(pipeline):
            group = row['_id']

            operations.append(UpdateOne(
                {
                    'metric': 'market_by_district_month',
                    'group_key.period': group.get('period'),
                    'group_key.city': group.get('city'),
                    'group_key.district': group.get('district'),
                    'group_key.subdistrict': group.get('subdistrict'),
                },
                {
                    '$set': {
                        'metric': 'market_by_district_month',
                        'period': group.get('period'),
                        'group_key':{
                            'city': group.get('city'),
                            'district': group.get('district'),
                            'subdistrict': group.get('subdistrict'),
                        },
                        'values': {
                            'avg_price': row.get('avg_price'),
                            'med_price': row.get('med_price'),
                            'avg_price_per_meter': row.get('avg_price_per_meter'),
                            'med_price_per_meter': row.get('med_price_per_meter'),

                        },
                        'count': row['count'],
                        'computed_at': now
                    }
                },
                upsert=True
            )
        )

        if operations:
            self.dashboard_aggregates_col.bulk_write(operations)

        return len(operations)


class OtodomGeoAggregator(OtodomDashAggregator):
    def __init__(self, poi_col):
        super().__init__()
        self.poi_col = self.db[poi_col]

    def find_pois_near(self, longitude:str=None, latitude:str=None, max_distance:int=1500, categories=('School', 'Kindergarten','Supermarket', 'Restaurant'), limit=None) -> list:
        query = {}
        col = self.poi_col

        if categories:
            query['category'] = {'$in': categories}

        pipeline = [
            {
                '$geoNear': {
                    'near': {
                        'type': 'Point',
                        'coordinates': [float(longitude), float(latitude)],
                    },
                    'distanceField': 'distance_m',
                    'maxDistance': max_distance,
                    'spherical': True,
                    'query': query,

                }
            },
            {
                    '$project': {
                        '_id': 1,
                        'osm_id': 1,
                        'category': 1,
                        'tags.name': 1,
                        'location': 1,
                        'distance_m': 1,
                    }
            },
        ]

        if limit:
            pipeline.append({'$limit': limit})

        return list(col.aggregate(pipeline))

    @staticmethod
    def build_poi_metrics(pois, ranges=(500,1000,1500)):
        metrics = {}
        for poi in pois:
            category = poi.get('category', 'other')
            distance = poi['distance_m']

            if category not in metrics:
                metrics[category] = {
                    'nearest_m': int(distance),
                    'nearest':{
                        'poi_id': str(poi['_id']),
                        'name': poi.get('tags', {}).get('name'),
                        'distance_m': int(distance),
                    },
                    **{f'count{r}m': 0 for r in ranges},
                }
            metrics[category]['nearest_m'] = min(metrics[category]['nearest_m'], distance)

            for r in ranges:
                if distance <= r:
                    metrics[category][f'count{r}m'] += 1

        return metrics





