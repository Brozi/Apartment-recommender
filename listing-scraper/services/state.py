from etl.services import connect_to_database
import logging, sys

from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
logger = logging.getLogger(__name__)
class StateUpdater:
    def __init__(self, db_name='otodom_data', listings_col='listings_clean', listings_scrape_col='listings'):
        self.db = connect_to_database()[db_name]
        self.col = self.db[listings_col]
        self.listings_scrape_col = self.db[listings_scrape_col]
        self.listings = []

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

    def run_global_sweeper(self):
        threshold_date = datetime.now(timezone.utc) - timedelta(hours=72)
        delete_threshold_date = datetime.now(timezone.utc) - timedelta(days=31)

        results_deactivate = self.col.update_many(
            {
                'is_active': True,
                '$or': [
                {'last_seen_at': {'$lt': threshold_date}},
                {'last_seen_at': {'$exists': False}},
                {'last_seen_at': None} # Failsafe for null insertions
                ]
            },
            {
                '$set': {
                    'is_active': False,
                    'deactivated_at': datetime.now(ZoneInfo('Europe/Warsaw'))
                }
            }
        )

        results_delete = self.listings_scrape_col.delete_many(
            {
                '$or': [
                    {'last_seen_at': {'$lt': delete_threshold_date}},
                ]
            }
        )

        logger.info(f'Sweeper deactivated {results_deactivate.modified_count} stale listings.')
        logger.info(f'Sweeper deleted {results_delete.modified_count} stale listings from the scrape col.')

