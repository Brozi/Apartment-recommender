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


class MongoBulkWriter:
    def __init__(self, collection, batch_size=5000, ordered=False):
        self.collection = collection
        self.batch_size = batch_size
        self.ordered = ordered
        self.operations = []
        self.processed_count = 0

    def queue(self, operation):
        self.operations.append(operation)
        if len(self.operations) >= self.batch_size:
            self.flush()

    def flush(self):
        if not self.operations:
            result = None
            return result

        result = self.collection.bulk_write(
            self.operations,
            ordered=self.ordered,
        )

        self.processed_count += len(self.operations)
        logging.info(f"Commited batch of {len(self.operations)} documents...")
        self.operations.clear()

        return result

class MongoBatchListingUploader:
    def __init__(self, input_col='listings', output_col='listings_clean', batch_size: int = 100):
        """Handles the state of database connections and batch operations."""
        self.database = connect_to_database()['otodom_data']
        self.input_collection = self.database[input_col]
        self.output_collection = self.database[output_col]

        self.clean_writer = MongoBulkWriter(
            self.output_collection,
            batch_size=batch_size,
            ordered=False,
        )

        self.raw_ack_writer = MongoBulkWriter(
            self.input_collection,
            batch_size=batch_size,
            ordered=False,
        )

        self.processed_count = 0


    def queue_operation(self, raw_id, otodom_id, transformed_doc):
        """Adds documents to the queue and flushes to the DB if the batch size is reached"""
        self.clean_writer.queue(
            UpdateOne(
                {'otodom_id': otodom_id },
                {'$set':{**transformed_doc, 'etl_processed': True}},
                upsert=True,
            )
        )

        self.raw_ack_writer.queue(
            UpdateOne(
                {'_id': raw_id},
                {'$set': {'etl_processed': True}},
                upsert=True
            )
        )
        self.processed_count += 1


    def flush_to_db(self):
        """Commits the current queues to the database and clears them."""
        self.clean_writer.flush()
        self.raw_ack_writer.flush()


