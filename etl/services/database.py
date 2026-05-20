import json
import logging
from mongoengine import connect as mongo_connect
from pymongo import MongoClient, UpdateOne

logger = logging.getLogger(__name__)


def connect_to_database(host: str = None) -> MongoClient:
    """
    Connect to the database.

    If host is None then tries to connect to the database
    with the url defined in settings.json.

    :param host: The host of the database
    """
    logger.info("Connecting to the database")
    if host is None:
        with open("settings.json", "r", encoding="utf-8") as f:
            settings = json.load(f)
            host = settings["database"]["host"]
            if not host:
                raise ValueError("Database host is not defined in settings.json")
    mongo_connect(host=host)
    return MongoClient(host)

class MongoBatchListingUploader:
    def __init__(self, input_col='listings', output_col='listings_clean', batch_size: int = 100):
        """Handles the state of database connections and batch operations."""
        self.database = connect_to_database()['otodom_data']
        self.input_collection = self.database[input_col]
        self.output_collection = self.database[output_col]

        self.batch_size = batch_size
        self.clean_operations = []
        self.raw_ack_operations = []
        self.processed_count = 0


    def queue_operation(self, raw_id, otodom_id, transformed_doc):
        """Adds documents to the queue and flushes to the DB if the batch size is reached"""
        self.clean_operations.append(
            UpdateOne({'otodom_id': otodom_id }, {'$set':{**transformed_doc, 'etl_processed': True}}, upsert=True))
        self.raw_ack_operations.append(
            UpdateOne(
                {'_id': raw_id}, {'$set': {'etl_processed': True}}, upsert=True)
        )
        self.processed_count += 1

        if len(self.clean_operations) >= self.batch_size:
            self.flush_to_db()


    def flush_to_db(self):
        """Commits the current queues to the database and clears them."""
        if not self.clean_operations:
            return
        self.output_collection.bulk_write(self.clean_operations)
        self.input_collection.bulk_write(self.raw_ack_operations)
        logging.info(f"Commited batch of {len(self.clean_operations)} documents...")

        self.clean_operations.clear()
        self.raw_ack_operations.clear()

