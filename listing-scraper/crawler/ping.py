from crawler import Crawler
from services import connect_to_database
from services import OtodomParser
from common import Constans, NOW
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
logger = logging.getLogger(__name__)
class PingCrawler(Crawler):
    def __init__(self, db_name='otodom_data', listings_col='listings'):
        super().__init__()
        self.listings: set[str] = set()
        self.db = connect_to_database(host=self.settings.mongo_db_host)[db_name]
        self.col = self.db[listings_col]

    def extract_links_from_page(self, page: int, override_url: str = None) -> list:
        """
        Crawl the given page and extract listings from the Next.js JSON.
        :return: List of listings on the currently scraped page
        """
        params = self.params.copy()
        params["page"] = page
        url = override_url if override_url else self.generate_search_url()

        logger.info(f"Extracting links from page {page}")
        response = self.network.get(url=url, params=params)

        if not response:
            logger.error(f"CRITICAL: Failed to extract page {page}. Skipping page.")
            return []
        return OtodomParser.parse_listings(response.text)

    def start_(self, pages: int) -> None:
        logger.info(f"Starting {pages} pages...")

        for page in range(1, pages + 1):
            if page % 15 == 0:
                self.network.rotate_session()

            page_items = self.extract_links_from_page(page)

            found_listings = set()
            for item in page_items:
                slug = item.get("slug")
                if not slug: continue
                full_url = f"{Constans.DEFAULT_URL}/pl/oferta/{slug}"
                item["full_url"] = full_url
                found_listings.add(item['full_url'])
            logger.info(f"Found {len(found_listings)} active listings on Page {page}...")

            if not found_listings:
                logger.info(f"Page {page} had no new listings. Moving to next page...")
                continue
            self.listings.update(found_listings)


        self.synchronize_listing_states()
