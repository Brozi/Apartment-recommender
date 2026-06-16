import concurrent.futures
import logging
import random
import time

from common import Constans
from crawler.listing import Listing
from services import connect_to_database
from services import PropertyService
from settings import Settings
from services import NetworkService
from services import OtodomParser


logger = logging.getLogger(__name__)


class Crawler:
    """
    A crawler for the otodom.pl website.

    The crawler is responsible for crawling the website, extracting the data
    and updating the database. This is achieved by the crawler being an orchestrator
    of listing_processor and investment_processor.
    Attributes:
        network (NetworkService): Shared HTTP client used by the crawler and its
            processors. Handles request delays, retries, DataDome responses, and
            session rotation.

        settings (Settings): Runtime scraper configuration loaded from
            settings.json, or defaults if loading fails. Used to build search
            URLs, query parameters, and the database connection.

        params (dict): Query parameters generated from the current settings.
            Currently contains the price filters sent to Otodom. Regenerate this
            with generate_params() after changing settings.price_min or
            settings.price_max.

        listings (list[Listing]): In-memory collection of successfully scraped
            listings. Both listing_processor and investment_processor append
            Listing objects to this same list before export.

        investments_queue (set[str]): Unique investment URLs waiting to be
            processed by investment_processor. Jobs/tests can add URLs directly
            to this set before calling process_queue().

        listing_processor (ListingProcessor): Processor responsible for standard
            listing pages. It fetches individual listing pages, extracts property
            and agency data, saves normal listings, and records hidden developer
            investments for later processing.

        investment_processor (InvestmentProcessor): Processor responsible for
            developer investment pages. It processes queued investment URLs,
            fetches paginated investment units, maps them into property data, and
            appends the resulting Listing objects to listings.
    """
    def __init__(self) -> None:
        self.network = NetworkService()
        self.settings: Settings = Settings()
        self.params: dict = self.generate_params()
        self.listings: list[Listing] = []
        self.active_listings: set[str] = set()
        self.investments_queue: set[str] = set()
        from services.investment import InvestmentProcessor
        from services.listing_processor import ListingProcessor
        #Move imports to avoid circular import issue
        self.listing_processor = ListingProcessor(self.network, self.listings)
        self.investment_processor = InvestmentProcessor(self.network, self.settings, self.listings)

        connect_to_database(host=self.settings.mongo_db_host)

    def generate_search_url(self) -> str:
        """
        Generate the URL to crawl. If the district is empty, the crawler crawls
        all districts.

        :return: The URL to crawl
        """
        url = self.settings.base_url
        url += "/pl/wyniki/"
        url += f"{self.settings.auction_type.value}/"
        url += f"{self.settings.property_type.value}/"
        url += f"{self.settings.province}/"
        if self.settings.city:
            url += f"{self.settings.city}/"
        if self.settings.district:
            url += f"{self.settings.district}/"
        return url

    def generate_params(self) -> dict:
        """
        Generate the price parameters. Used by both crawler.py and discovery.py.

        :return: The price range used by the crawler and discoverer to define price chunks
        """
        return {
            "priceMin": self.settings.price_min,
            "priceMax": self.settings.price_max,
        }

    def count_pages(self, override_url: str = None) -> tuple[int, int] | None:
        """
        Count the number of pages to crawl using Regex to bypass HTML parser limits.
        :return: A tuple containing the number of pages to crawl, as well as the total number of listings
        on all those pages
        """
        search_url = override_url if override_url else self.generate_search_url()
        print("\n--- Initializing Search ---")
        logger.info("Counting pages to crawl...")
        response = self.network.get(url=search_url, params=self.params, timeout=20)

        if not response:
            raise Exception("CRITICAL: Failed to count pages. IP might be blocked.")

        html = response.text
        print(f"Status: {response.status_code}, Length: {len(html)}")

        with open("debug_page.html", "w", encoding="utf-8") as f:
            f.write(html)
        return OtodomParser.parse_page_count(response.text)

    def extract_listings_from_page(self, page: int, override_url: str = None) -> list:
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
        """
        Starts the crawler by fetching one page, reading its apartments,
        and then moving to the next page.
        :param pages: The number of pages to crawl
        """
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

                if full_url in existing_links:
                    PropertyService.mark_seen_by_link(full_url)
                    continue
                item["full_url"] = full_url
                valid_listings.append(item)

            if not valid_listings:
                print(f"Page {page} had no new listings. Moving to next page...")
                continue

            print(f"Processing {len(valid_listings)} new apartments from Page {page}...")
            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
                list(executor.map(self.listing_processor.extract_listing_data, valid_listings))

            if self.investments_queue:
                self.investment_processor.process_queue(self.investments_queue)

            print(f"Finished Page {page}. Moving to next page...")
            delay = random.uniform(8.0, 15.0)
            print(f"Sleeping {delay:.2f}s before loading the next search page...")
            time.sleep(delay)