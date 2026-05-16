import json
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

from etl.services import connect_to_database

def upload_to_mongo(json_path, db_name):
    client = connect_to_database()
    db = client[db_name]
    poi_collection = db['pois']

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    bulk_docs = []

    for element in data.get('elements', []):
        lat = element.get('lat') or element.get('center', {}).get('lat')
        lon = element.get('lon') or element.get('center', {}).get('lon')

        if lat and lon:
            doc = {
                'osm_id': element['id'],
                'type': element['type'],
                'tags': element.get('tags', {}),
                'name': element.get('tags', {}).get('name'),
                'category': determine_category(element.get('tags', {})),
                'location': {
                    'type': 'Point',
                    'coordinates': [lon, lat]
                }
            }
            bulk_docs.append(doc)
            logging.info(f'Successfully parsed document: {doc["osm_id"]}')
    if bulk_docs:
        poi_collection.insert_many(bulk_docs)
        poi_collection.create_index([('location', '2dsphere')])
        logging.info(f'Successfully indexed {len(bulk_docs)} pois')

def determine_category(tags):
    if 'amenity' in tags: return beautify_string(tags['amenity'])
    if 'vending' in tags: return beautify_string(tags['vending'])
    if 'highway' in tags: return beautify_string(tags['highway'])
    if 'shop' in tags: return beautify_string(tags['shop'])
    if 'railway' in tags: return beautify_string(tags['railway'])
    return 'other'

def beautify_string(string):
    string = string.replace('_', ' ')
    string = string.title()
    return string

if __name__ == "__main__":
    upload_to_mongo('../../pois_poland_merged.json', 'otodom_data')