import logging

from etl.services import MongoBatchListingUploader
from etl.transformers.otodom import  OtodomTransformer

logger = logging.getLogger(__name__)

def quantile(values, q):
    values = sorted(values)

    if not values:
        return None
    pos = (len(values) - 1) * q
    lower = int(pos)
    upper = min(lower +1, len(values) - 1)
    weight = pos - lower

    return values[lower] * (1-weight) + values[upper] * weight

def calculate_price_threshold(collection, q=0.0015):
    prices = []

    for doc in collection.find({}, {'price': 1}):
        try:
            price = float(doc.get('price'))
        except (TypeError, ValueError):
            continue

        if price > 0:
            prices.append(price)

    return quantile(prices, q)


class ETLPipeline:
    def __init__(self, input_col='listings', output_col='listings_clean'):
        """Orchestrates the data extraction, transformation, and loading."""
        self.uploader = MongoBatchListingUploader(input_col=input_col,output_col=output_col,batch_size=100)
        self.transformer = OtodomTransformer()

    def run(self):
        price_threshold = calculate_price_threshold(collection=self.uploader.input_collection, q=0.0015)
        logging.info(f'Calculated price threshold: {price_threshold}')
        cursor = self.uploader.input_collection.find({'etl_processed': {'$ne': True}})

        for raw_doc in cursor:
            transformed_doc = self.transformer.transform(raw_doc, price_threshold)

            if transformed_doc:
                self.uploader.queue_operation(
                    raw_id=raw_doc['_id'],
                    otodom_id=transformed_doc['otodom_id'],
                    transformed_doc=transformed_doc
                )
        self.uploader.flush_to_db()
        logger.info(f'ETL complete. Processed {self.uploader.processed_count} listings.')
