from etl.aggregators import OtodomGeoAggregator, OtodomDashAggregator

import json

if __name__ == '__main__':
    agg = OtodomGeoAggregator('pois')
    nearby_pois = agg.find_pois_near(19.90835, 50.09434)
    print(json.dumps(nearby_pois, indent=4))
    metrics = agg.build_poi_metrics(nearby_pois)
    print(json.dumps(metrics, indent=4))
    agg = OtodomDashAggregator(dashboard_col='dashboard_aggregates_v3')
    updated_count = agg.build_dash_aggregates()
    print(f'Updated count: {updated_count}')
