import logging

from etl.services import MongoBatchUploader
from etl.transformers.otodom import  OtodomTransformer

class ETLPipeline:
    def __init__(self):
        """Orchestrates the data extraction, transformation, and loading."""
        self.uploader = MongoBatchUploader(batch_size=100)
        self.transformer = OtodomTransformer()

    def run(self):
        cursor = self.uploader.input_collection.find({'etl_processed': {'$ne': True}})

        for raw_doc in cursor:
            transformed_doc = self.transformer.transform(raw_doc)

            if transformed_doc:
                self.uploader.queue_operation(
                    raw_id=raw_doc['_id'],
                    otodom_id=transformed_doc['otodom_id'],
                    transformed_doc=transformed_doc
                )
        self.uploader.flush_to_db()
        logging.info(f'ETL complete. Processed {self.uploader.processed_count} listings.')
