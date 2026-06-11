from etl.aggregators import OtodomAggregator
from etl.judges import OtodomScoreJudge
from etl.services import MongoBulkWriter

from datetime import datetime
from pymongo import UpdateOne
import logging

logger = logging.getLogger(__name__)

class ScorePipeline(OtodomAggregator):
    def __init__(
            self,
            listings_col='listings_clean',
            output_col='listings_clean',
            agg_col='dashboard_aggregates',
            absolute_max_distance=15000
    ):
        super().__init__(listings_col=listings_col)
        self.aggregate_col = self.db[agg_col]
        self.judge = OtodomScoreJudge(listings_col=listings_col, output_col=output_col, agg_col=agg_col)
        self.writer = MongoBulkWriter(collection=self.db[output_col], batch_size=1000, ordered=False)
        self.target_period = datetime.now().strftime("%Y-%m")
        logger.info(f"Starting pipeline for period: {self.target_period}")
        self.listing_query = {'score_metrics': {'$exists': True}}
        self.absolute_max_distance = absolute_max_distance

    def run(self, recompute: bool=False):
        aggregates_map = self.judge.download_aggregates(target_period=self.target_period)
        if not aggregates_map:
            logger.error("Fatal: No aggregate data found for this period. Aborting.")
            return

        if not recompute:
            self.listing_query['score_metrics'] = {'$exists': False}

        listings = self.listings_col.find(self.listing_query)

        for listing in listings:
            scores = self.judge.calculate_metrics(listing, aggregates_map, self.absolute_max_distance)
            self.writer.queue(
                UpdateOne(
                    {'_id': listing['_id']},
                    {'$set': {'score_metrics': scores}},
                    upsert=True
                )
            )

        self.writer.flush()
        logger.info(f'Score Pipeline complete. Processed {self.writer.processed_count} listings.')