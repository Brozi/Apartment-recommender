from datetime import datetime, timezone

from pymongo import UpdateOne

from etl.aggregators.otodom_aggregator import OtodomAggregator
from etl.services import MongoBulkWriter

class OtodomGeoAggregator(OtodomAggregator):
    def __init__(self, poi_col='pois', output_col='listings_clean'):
        super().__init__()
        self.poi_col = self.db[poi_col]
        self.listings_col = self.db[output_col]

    def find_pois_near(self,
                       longitude:float=None,
                       latitude:float=None,
                       max_distance:int=1500,
                       category_groups=(
                               'tram_stop',
                               'bus_stop',
                               'school',
                               'grocery_retail',
                               'parcel_service'
                       ),
                       limit=None) -> list:
        query = {}
        col = self.poi_col

        if category_groups:
            query['category_group'] = {'$in': category_groups}

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
                        'category_group': 1,
                        'category_groups': 1,
                        'category': 1,
                        'raw_category': 1,
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
            category_group = poi.get('category_group', 'other')
            distance = poi['distance_m']

            if category_group not in metrics:
                metrics[category_group] = {
                    'nearest_m': int(distance),
                    'nearest':{
                        'poi_id': str(poi['_id']),
                        'name': poi.get('tags', {}).get('name', 'Unknown'),
                        'distance_m': int(distance),
                    },
                    **{f'count_{r}m': 0 for r in ranges},
                }
            metrics[category_group]['nearest_m'] = min(metrics[category_group]['nearest_m'], distance)

            for r in ranges:
                if distance <= r:
                    metrics[category_group][f'count_{r}m'] += 1

        return metrics

    @staticmethod
    def _extract_coordinates(listing_doc: dict) -> tuple[float, float]:
        coordinates_array = listing_doc.get('geo_location', {}).get('coordinates', [])
        lon = float(coordinates_array[0])
        lat = float(coordinates_array[1])
        return lon, lat

    def add_poi_metrics(self):
        writer = MongoBulkWriter(self.listings_col, batch_size=500, ordered=False)

        cursor = self.listings_col.find()

        for listing in cursor:
            lon, lat = self._extract_coordinates(listing)
            pois = self.find_pois_near(latitude=lat, longitude=lon)
            metrics = self.build_poi_metrics(pois)

            writer.queue(
                UpdateOne(
                    {'_id': listing['_id']},
                    {
                        '$set': {
                            'geo_aggregations': metrics,
                            'geo_aggregations_computed_at': datetime.now(timezone.utc)
                        }
                    },
                    upsert=False
                )
            )
        writer.flush()