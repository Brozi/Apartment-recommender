from crawler import Crawler
import time
import random
import re
import sys
import datetime
import logging
import os

from jobs import export_to_github_actions
from services import ExportService


class TerminalLogger:
    def __init__(self, filename, stream):
        self.terminal = stream
        log_dir = os.path.dirname(filename)
        if log_dir:
            os.makedirs(log_dir, exist_ok=True)
        self.log_file = open(filename, "a", encoding="utf-8")
        self.ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')

    def write(self, message):
        self.terminal.write(message)
        self.terminal.flush()
        clean_msg = self.ansi_escape.sub('', message)
        self.log_file.write(clean_msg)
        self.log_file.flush()

    def flush(self):
        self.terminal.flush()
        self.log_file.flush()


log_filename = datetime.datetime.now().strftime("log/scraper_log_%Y-%m-%d_%H-%M-%S.txt")
sys.stdout = TerminalLogger(log_filename, sys.stdout)
sys.stderr = TerminalLogger(log_filename, sys.stderr)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)



def scrape_assigned_chunk(crawler, master_list):
    pages, total_listings = crawler.count_pages()

    if pages == 0:
        print("Assigned chunk has 0 listings. Skipping.")
        return

    print(
        f"Scraping assigned chunk: "
        f"{crawler.settings.property_type.value}, "
        f"{crawler.settings.price_min}-{crawler.settings.price_max} PLN "
        f"({pages} pages, {total_listings} listings)"
    )

    crawler.start(pages)

    master_list.extend(crawler.listings)
    crawler.listings.clear()


def main():
    export_service = ExportService()
    crawler = Crawler()

    # 1. Read the EXACT range assigned to this specific GitHub Action runner
    # The workflow file already injected this runner's specific bounds into settings.json

    all_listings = []

    try:
        scrape_assigned_chunk(crawler, all_listings)

    except KeyboardInterrupt:
        print("\nManually stopped by user!")
    except Exception as e:
        print(f"\nBLOCK DETECTED OR CRITICAL ERROR: {e}")

    finally:
        print(f"\nScript finished! Gathered {len(all_listings)} total listings in this chunk.")
        print("Saving gathered data to CSV...")

        export_service.to_csv_file(all_listings,"listings.csv")
        export_service.to_excel_file("listings.xlsx")


if __name__ == "__main__":
    main()