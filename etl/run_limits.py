import logging
import sys

from etl.aggregators import OtodomFilterLimitsAggregator


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
limits = OtodomFilterLimitsAggregator(
        listings_col='listings_clean',
        filter_limits_col='filter_limits'
    )
limits.run()