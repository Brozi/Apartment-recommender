import json
import logging
import sys

from pymongo import UpdateOne

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout
)

from etl.helpers.categorize_pois import categorize_poi
from etl.services import connect_to_database, MongoBulkWriter

def upload_to_mongo(json_path, db_name):
    client = connect_to_database()
    db = client[db_name]
    poi_collection = db['pois']

    poi_collection.create_index([('location', '2dsphere')])

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    bulk_operations = []

    for element in data.get('elements', []):
        lat = element.get('lat') or element.get('center', {}).get('lat')
        lon = element.get('lon') or element.get('center', {}).get('lon')

        if lat and lon:
            unique_id = f'{element['type']}_{element['id']}'
            doc = {
                'osm_id': element['id'],
                'type': element['type'],
                'tags': element.get('tags', {}),
                'category': determine_category(element.get('tags', {})),
                'location': {
                    'type': 'Point',
                    'coordinates': [lon, lat]
                }
            }
            bulk_operations.append(
                UpdateOne(
                    {'_id': unique_id},
                    {'$set': doc},
                    upsert=True
                )
            )
            logging.info(f'Successfully parsed document: {doc["osm_id"]}')
    if bulk_operations:
        logging.info(f'Executing bulk upsert for {len(bulk_operations)} documents...')
        try:
            result = poi_collection.bulk_write(bulk_operations, ordered=False)
            logging.info(f'Successfully indexed {result.upserted_count} and modified existing {result.modified_count} POIs.')
        except Exception as e:
            logging.error(f'FATAL: Bulk write failed. {e}')


def upload_to_mongo_grouped_categories(json_path, db_name):
    client = connect_to_database()
    db = client[db_name]
    poi_collection = db['pois']

    writer = MongoBulkWriter(
        poi_collection,
        batch_size=50000,
        ordered=False,
    )

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)


    for element in data.get('elements', []):
        lat = element.get('lat') or element.get('center', {}).get('lat')
        lon = element.get('lon') or element.get('center', {}).get('lon')

        if lat is not None and lon is not None:
            tags = element.get('tags', {})
            category_data = categorize_poi(tags)
            unique_id = f'{element['type']}_{element['id']}'
            doc = {
                'osm_id': element['id'],
                'type': element['type'],
                'tags': element.get('tags', {}),
                **category_data,
                'location': {
                    'type': 'Point',
                    'coordinates': [lon, lat]
                },
            }

            writer.queue(
                UpdateOne(
                    {'_id': unique_id},
                    {'$set': doc},
                    upsert=True
                )
            )

    try:
        writer.flush()
        logging.info(f'Successfully processed {writer.processed_count} POIs.')

        logging.info('Creating POI indexes...')
        poi_collection.create_index([('location', '2dsphere')])
        # poi_collection.create_index([('category_group', 1)])
        # poi_collection.create_index([('category_groups', 1)])
        poi_collection.create_index([('category', 1)])
        logging.info('POI indexes created.')

    except Exception:
        logging.exception(f'FATAL: Bulk write failed')
        raise

def determine_category(tags):
    if 'amenity' in tags: return _beautify_string(tags['amenity'])
    if 'vending' in tags: return _beautify_string(tags['vending'])
    if 'highway' in tags: return _beautify_string(tags['highway'])
    if 'shop' in tags: return _beautify_string(tags['shop'])
    if 'railway' in tags: return _beautify_string(tags['railway'])
    return 'other'

def _beautify_string(string):
    string = string.replace('_', ' ')
    string = string.title()
    return string

if __name__ == "__main__":
    #upload_to_mongo('../../pois_poland_merged.json', 'otodom_data')
    upload_to_mongo_grouped_categories('../../pois_poland_merged.json', 'otodom_data')