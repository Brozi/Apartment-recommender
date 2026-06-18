from pymongo import UpdateOne
import logging

logger = logging.getLogger(__name__)

from .otodom_aggregator import OtodomAggregator
from datetime import datetime
from zoneinfo import ZoneInfo
import pygeohash as pgh

from etl.services import MongoBulkWriter

class OtodomGeoAggregator(OtodomAggregator):
    def __init__(self, poi_col='pois', output_col='listings_clean'):
        super().__init__()
        self.poi_col = self.db[poi_col]
        self.listings_col = self.db[output_col]
        self.absolute_max_distance = 0

    def find_pois_near(self,
                       longitude:float=None,
                       latitude:float=None,
                       max_distance:int=1500,
                       category_groups=(
                               'tram_stop',
                               'bus_stop',
                               'school',
                               'grocery_retail',
                               'parcel_service',
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
    def build_poi_metrics(pois, category_groups: tuple, max_distance:int=1500, step:int=500) -> dict:
        ranges = tuple(range(0, max_distance+1, step))
        ranges = ranges[1:]
        metrics = {}

        for category_group in category_groups:
            metrics[category_group] = {
                'nearest_m': None,
                'nearest': None,
                **{f'count_{r}m': 0 for r in ranges},
            }

        for poi in pois:
            category_group = poi.get('category_group', 'other')

            if category_group not in metrics:
                continue
            distance = int(poi['distance_m'])

            location = poi.get('location', {})

            nearest = {
                'poi_id': str(poi['_id']),
                'name': poi.get('tags', {}).get('name', 'Unknown'),
                'distance_m': distance,
                'location': location,
            }

            current_nearest = metrics[category_group]['nearest_m']
            if current_nearest is None or distance < current_nearest:
                metrics[category_group]['nearest_m'] = distance
                metrics[category_group]['nearest'] = nearest

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

    def add_poi_metrics(
            self,
            category_groups:tuple,
            max_distance: int=1500,
            step: int=500,
            cursor_size: int=1000,
            recompute: bool=False,
    ):
        self.absolute_max_distance = max_distance * 10
        writer = MongoBulkWriter(self.listings_col, batch_size=cursor_size, ordered=False)

        base_query = {
            'geo_location.coordinates.1': {'$exists': True},
        }

        if not recompute:
            base_query['geo_aggregations'] = {'$exists': False}
            base_query['geohash'] = {'$exists': False}

        projection = {
            '_id': 1,
            'geo_location': 1,
        }

        last_id = None
        updated_count = 0

        while True:
            query = dict(base_query)

            if last_id is not None:
                query['_id'] = {'$gt': last_id}

            listings = list(
                self.listings_col
                .find(query, projection)
                .sort('_id', 1)
                .limit(cursor_size)
            )

            if not listings:
                break

            for listing in listings:
                last_id = listing['_id']

                try:
                    lon, lat = self._extract_coordinates(listing)
                except (IndexError, ValueError, TypeError):
                    logger.warning("Skipping listing %s because it has invalid geo_location", listing['_id'])
                    continue

                pois = self.find_pois_near(
                    latitude=lat,
                    longitude=lon,
                    max_distance=max_distance,
                    category_groups=category_groups
                )
                metrics = self.build_poi_metrics(
                    pois=pois,
                    category_groups=category_groups,
                    max_distance=max_distance,
                    step=step,
                )

                for category, data in metrics.items():
                    if data['nearest'] is None:
                        fallback_poi = self.find_absolute_nearest_poi(lon, lat, category, self.absolute_max_distance)

                        if fallback_poi:
                            distance = int(fallback_poi['distance_m'])
                            metrics[category]['nearest_m'] = distance
                            metrics[category]['nearest'] = {
                                'poi_id': str(fallback_poi['_id']),
                                'name': fallback_poi.get('tags', {}).get('name', 'Unknown'),
                                'distance_m': distance,
                                'location': fallback_poi.get('location', {}),
                            }

                metrics['geo_aggregations_computed_at'] = datetime.now(ZoneInfo('Europe/Warsaw'))

                writer.queue(
                    UpdateOne(
                        {'_id': listing['_id']},
                        {
                            '$set': {
                                'geo_aggregations': metrics,
                                'geohash': pgh.encode(latitude=lat, longitude=lon),
                            }
                        },
                        upsert=False
                    )
                )

                updated_count += 1

            writer.flush()

        logger.info("GeoAggregation complete. Updated %s listings.", updated_count)


    def find_absolute_nearest_poi(self, longitude: float, latitude: float, category: str, max_distance: int) -> dict | None:
        pipeline = [
            {
                '$geoNear': {
                    'near': {
                        'type': 'Point',
                        'coordinates': [float(longitude), float(latitude)],
                    },
                    'distanceField': 'distance_m',
                    'spherical': True,
                    'query': {'category_group': category},
                    'maxDistance': max_distance
                }
            },
            {'$limit': 1},
            {
                '$project': {
                    '_id': 1,
                    'osm_id': 1,
                    'category_group': 1,
                    'tags.name': 1,
                    'location': 1,
                    'distance_m': 1,
                }
            }
        ]

        result = list(self.poi_col.aggregate(pipeline))
        return result[0] if result else None