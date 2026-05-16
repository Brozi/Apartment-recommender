from etl.services import connect_to_database
from pymongo import GEOSPHERE, ASCENDING
import logging
import sys

logger = logging.getLogger(__name__)
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)

def initialize_input_database(raw_col='listings'):

    client = connect_to_database()
    database = client.get_default_database()

    raw_collection = database[raw_col]

    logger.info("Building partial index for ETL queue...")

    raw_collection.create_index(
        [('etl_processed', 1)],
        partialFilterExpression={'etl_processed': False},
    )

    logger.info("Database initialization complete.")
def initialize_output_database(raw_col='listings_clean'):
    client = connect_to_database()

    database=client.get_default_database()

    collection = database[raw_col]

    collection.create_index([('geo_location', GEOSPHERE)], name='geo_location_2dsphere')

    collection.create_index([
        ('localization.city', ASCENDING),
        ('localization.district', ASCENDING),
    ], name='localization_compound_idx')

    collection.create_index([('price', ASCENDING)], name='price_idx')
    collection.create_index([('area', ASCENDING)], name='area_idx')

    logger.info("SUCCESS: All indexes created")

    for index in collection.list_indexes():
        logger.info(f"Index {index} created")

if __name__ == "__main__":
    initialize_input_database()
    initialize_output_database()
