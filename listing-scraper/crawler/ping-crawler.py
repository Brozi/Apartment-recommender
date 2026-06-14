from crawler import Crawler
from services import PropertyService
from common import Constans
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
logger = logging.getLogger(__name__)
class PingCrawler(Crawler):
    def __init__(self):
        super().__init__()
        self.listings: set[str] = set()

    def extract_links_from_page(self, page: int, override_url: str = None) -> list:
        """
        Crawl the given page and extract listings from the Next.js JSON.
        :return: List of listings on the currently scraped page
        """
        params = self.params.copy()
        params["page"] = page
        url = override_url if override_url else self.generate_search_url()

        logger.info(f"Extracting listings from page {page}")
        response = self.network.get(url=url, params=params)

        if not response:
            logger.error(f"CRITICAL: Failed to extract page {page}. Skipping page.")
            return []
        return OtodomParser.parse_listings(response.text)

    def start(self, pages: int) -> None:
        existing_links = PropertyService.get_all_links()

        for page in range(1, pages + 1):
            if page % 15 == 0:
                self.network.rotate_session()

            page_items = self.extract_listings_from_page(page)

            valid_listings = []
            for item in page_items:
                slug = item.get("slug")
                if not slug: continue
                full_url = f"{Constans.DEFAULT_URL}/pl/oferta/{slug}"

                if full_url not in existing_links:
                    item["full_url"] = full_url
                    valid_listings.append(item)

            if not valid_listings:
                print(f"Page {page} had no new listings. Moving to next page...")
                continue

            print(f"Processing {len(valid_listings)} new apartments from Page {page}...")