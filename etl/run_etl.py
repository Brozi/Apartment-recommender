import logging
import sys

from etl.aggregators import OtodomDashAggregator, OtodomGeoAggregator
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
        dashboard_col='dashboard_aggregates'
    )
    dash.build_dash_aggregates()

    geo = OtodomGeoAggregator(
        poi_col = 'pois',
        output_col = 'listings_clean',
    )
    category_groups = (
        'tram_stop',
        'bus_stop',
        'kindergarten',
        'school',
        'university',
        'specialized_school',
        'grocery_retail',
        'parcel_service'
    )
    geo.add_poi_metrics(category_groups=category_groups, max_distance=1500)

