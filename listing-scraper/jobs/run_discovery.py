import sys
import os
import json
import uuid

# Add the parent directory to the path so it can import your modules
#sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

current_dir = os.path.dirname(os.path.abspath(__file__))  # path/to/jobs
scraper_dir = os.path.dirname(current_dir)                # path/to/otodomscraper

# Add scraper_dir to path so it can import your modules
sys.path.append(scraper_dir)

# --- ADD THIS LINE ---
# Change the working directory so Python finds settings.json exactly where it expects it!
os.chdir(scraper_dir)

from crawler import Crawler
from services.discovery import RangeDiscoverer


def export_to_github_actions(chunks: list[dict]):
    # Convert [{"min": 0, "max": 10000}, ...] into ["0-10000", ...]
    # This completely bypasses the GitHub Actions JSON secret scanner
    matrix_json = json.dumps(chunks)
    print(f"\nMatrix: {matrix_json}")

    if "GITHUB_OUTPUT" in os.environ:
        delimiter = f"EOF-{uuid.uuid4()}"
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"matrix<<{delimiter}\n")
            f.write(f"{matrix_json}\n")
            f.write(f"{delimiter}\n")


def main():
    crawler = Crawler()

    # 1. Read limits and chunk configurations directly from settings
    global_min = crawler.settings.price_min
    global_max = crawler.settings.price_max

    # Use getattr() just in case an older settings.json doesn't have the key yet
    chunk_limit = getattr(crawler.settings, "max_listings_per_chunk", 2800)
    page_limit = getattr(crawler.settings, "max_pages_per_chunk", 10)

    chunks = []

    for p_type in crawler.settings.property_types:
        print(f"\nDiscovering ranges for {p_type.name.lower()}")

        crawler.settings.property_type = p_type
        crawler.params = crawler.generate_params()

        discoverer = RangeDiscoverer(
            max_listings_per_chunk=chunk_limit,
            max_pages_per_chunk=page_limit,
            global_max=global_max,
        )
        discoverer.discover(crawler, global_min, global_max)

        for r in discoverer.get_final_matrix():
            chunks.append({
                "property_type": p_type.name.lower(),
                "low": r[discoverer.min_range_name],
                "high": r[discoverer.max_range_name],
            })

    export_to_github_actions(chunks)

if __name__ == "__main__":
    main()