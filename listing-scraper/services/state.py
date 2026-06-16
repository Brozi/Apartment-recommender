from etl.services import connect_to_database
import logging, sys

from datetime import datetime
from zoneinfo import ZoneInfo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
logger = logging.getLogger(__name__)
class StateUpdater:
    def __init__(self, active_listings:set, db_name='otodom_data', listings_col='listings'):
        self.db = connect_to_database()[db_name]
        self.col = self.db[listings_col]
        self.listings = active_listings

    def synchronize_listing_states(self):
        logger.info("Marking scraped IDs as active...")
        self.col.update_many(
            {'link': {'$in': list(self.listings)}},
            {'$set': {'is_active': True}},
        )
        logger.info("Deactivating dead listings...")
        deactivation_result = self.col.update_many(
            {
                'is_active': True,
                'link': {'$nin': list(self.listings)}
            },
            {
                '$set': {
                    'is_active': False,
                    'deactivated_at': datetime.now(ZoneInfo('Europe/Warsaw'))
                }
            }
        )
        logger.info(f'State sync complete. Deactivated {deactivation_result.modified_count} stale listings.')