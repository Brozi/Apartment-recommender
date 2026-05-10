from etl.services import connect_to_database
from pymongo import GEOSPHERE, ASCENDING
import logging

logger = logging.getLogger(__name__)
def initialize_input_database(raw_col='Properties'):

    client = connect_to_database()
    database = client.get_default_database()

    raw_collection = database[raw_col]

    logger.info("Building partial index for ETL queue...")

    raw_collection.create_index(
        [('etl_processed', 1)],
        partialFilterExpression={'etl_processed': {'$ne': True}},
    )

    logger.info("Database initialization complete.")
def initialize_output_database(raw_col='Properties_clean'):
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

    logger.info("SUCCES: All indexes created")

    for index in collection.list.indexes():
        logger.info(f"Index {index} created")

if __name__ == "__main__":
    initialize_input_database()
    initialize_output_database()
