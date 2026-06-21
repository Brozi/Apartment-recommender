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

    def run_global_sweeper(self, delta_factor: int = 6, base_delete_threshold: int = 31, base_deactivate_threshold: int = 72 ):
        """
        This function deactivates and deletes stale listings
        :param delta_factor: The number by which the program should multiply
        the base delete threshold to get the listings_clean col delete threshold. Default: 6
        :param base_delete_threshold: The number that means how many days the listings should be in the
        staled state before they're deleted from the listings col. Default: 31 days
        :param base_deactivate_threshold: the number of hours since the listing being last
        seen in order to deactivate it. Default: 72 hours
        """
        threshold_date = datetime.now(timezone.utc) - timedelta(hours=72)
        delete_threshold_date = datetime.now(timezone.utc) - timedelta(days=31)
        clean_col_threshold_date = datetime.now(timezone.utc) - timedelta(days=base_delete_threshold*delta_factor)
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

        results_delete_listings = self.listings_scrape_col.delete_many(
            {
                    'last_seen_at': {'$lt': delete_threshold_date},
            }
        )

        results_delete_clean = self.col.delete_many(
            {
                'last_seen_at': {'$lt': clean_col_threshold_date},
            }
        )

        logger.info(f'Sweeper deactivated {results_deactivate.modified_count} stale listings.')
        logger.info(f'Sweeper deleted {results_delete_listings.deleted_count} stale listings from the scrape collection.')
        logger.info(f'Sweeper deleted {results_delete_clean.deleted_count} stale listings from the clean collection.')

