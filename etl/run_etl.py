import logging
import sys

from etl.aggregators import OtodomDashAggregator
from etl.pipeline import ETLPipeline



logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
if __name__ == "__main__":
    pipeline = ETLPipeline(
        input_col='properties_test',
        output_col='listings_clean',
    )
    pipeline.run()

    dash = OtodomDashAggregator(
        listings_col = 'listings_clean',
        dashboard_col='dashboard_aggregates_v3'
    )
    dash.build_dash_aggregates()