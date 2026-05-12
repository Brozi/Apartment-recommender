import logging

from etl.services import MongoBatchUploader
from etl.transformers.otodom import  OtodomTransformer

logger = logging.getLogger(__name__)

class ETLPipeline:
    def __init__(self, input_col='Properties', output_col='Properties_clean'):
        """Orchestrates the data extraction, transformation, and loading."""
        self.uploader = MongoBatchUploader(input_col=input_col,output_col=output_col,batch_size=100)
        self.transformer = OtodomTransformer()

    def run(self):
        cursor = self.uploader.input_collection.find({'etl_processed': {'$ne': True}})

        for raw_doc in cursor:
            transformed_doc = self.transformer.clean_localization(raw_doc)

            if transformed_doc:
                self.uploader.queue_operation(
                    raw_id=raw_doc['_id'],
                    otodom_id=transformed_doc['otodom_id'],
                    transformed_doc=transformed_doc
                )
        self.uploader.flush_to_db()
        logger.info(f'ETL complete. Processed {self.uploader.processed_count} listings.')
