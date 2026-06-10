import logging
import sys

from etl.judges import ScorePipeline


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
if __name__ == "__main__":
    scoring = ScorePipeline(
        listings_col='Properties_clean',
        output_col='Properties_clean',
        agg_col='dashboard_aggregates'
    )
    scoring.run()