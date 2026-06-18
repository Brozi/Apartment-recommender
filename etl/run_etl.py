import logging
import sys

from etl.aggregators import OtodomDashAggregator, OtodomGeoAggregator, OtodomFilterLimitsAggregator
from etl.pipeline import ETLPipeline
from etl.judges import ScorePipeline



logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stdout

)
if __name__ == "__main__":
    pipeline = ETLPipeline(
        input_col='listings',
        output_col='listings_clean',
    )
    pipeline.run(recompute=False)

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
        'parcel_service',
        'driving_school',
    )
    geo.add_poi_metrics(category_groups=category_groups, max_distance=1500, recompute=False, compute_geohash=True)

    limits = OtodomFilterLimitsAggregator(
        listings_col='listings_clean',
        filter_limits_col='filter_limits'
    )
    limits.run()

    score = ScorePipeline(
        listings_col='listings_clean',
        output_col='listings_clean',
        agg_col='dashboard_aggregates',
        absolute_max_distance=geo.absolute_max_distance,
    )
    score.run(recompute=False)