from etl.aggregators import OtodomGeoAggregator, OtodomDashAggregator

import json

if __name__ == '__main__':
    agg = OtodomGeoAggregator(poi_col='pois', listings_col='listings_clean')
    categories = ('tram_stop', 'bus_stop','kindergarten', 'school', 'university', 'specialized_school', 'grocery_retail', 'parcel_service')
    nearby_pois = agg.find_pois_near(longitude=19.90835, latitude=50.09434, category_groups=categories, max_distance=1500)
    print(json.dumps(nearby_pois, indent=4, ensure_ascii=False))
    metrics = agg.build_poi_metrics(nearby_pois)
    print(json.dumps(metrics, indent=4,ensure_ascii=False))
    agg = OtodomDashAggregator(dashboard_col='dashboard_aggregates', listings_col='listings_clean')
    updated_count = agg.build_dash_aggregates()
    print(f'Updated count: {updated_count}')
