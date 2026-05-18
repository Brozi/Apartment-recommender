from datetime import datetime, timezone

from etl.services import connect_to_database

from pymongo import UpdateOne

class OtodomAggregator:
    def __init__(self, db_name='otodom_data', listings_col='listings_clean', dashboard_col='dashboard_aggregates'):
        self.db = connect_to_database()[db_name]
        self.listings_col = self.db[listings_col]
        self.dashboard_aggregates_col = self.db[dashboard_col]

class OtodomDashAggregator(OtodomAggregator):
    def __init__(self):
        super().__init__()


    def build_dash_aggregates(self):
        metrics = {
           'offer_count_by_construction_status': self._count_by_construction_status_pipeline(),
           'offer_count_by_rooms': self._count_by_rooms_pipeline(),
           'offer_count_by_build_year': self._count_by_build_year_pipeline(),
           'monthly_area_stats': self._monthly_area_stats_pipeline(),
           'monthly_price_stats': self._monthly_price_stats_pipeline(),
           'monthly_price_per_meter_stats': self._monthly_price_per_meter_stats_pipeline(),
           'offer_count_by_market_type': self._count_by_market_type_pipeline()

       }

        total_updated = 0

        for metric_name, pipeline in metrics.items():
            rows = list(self.listings_col.aggregate(pipeline, allowDiskUse=True))
            total_updated += self._save_dashboard_metric(metric_name, rows)

        return total_updated


    def _save_dashboard_metric(self, metric_name, rows):
        now = datetime.now(timezone.utc)
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
                        'computed_at': now
                    }
                },
                upsert=True
            )
        )

        if operations:
            self.dashboard_aggregates_col.bulk_write(operations)

        return len(operations)


class OtodomGeoAggregator(OtodomAggregator):
    def __init__(self, poi_col='pois'):
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





