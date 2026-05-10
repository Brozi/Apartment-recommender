import logging
import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

class OtodomTransformer:
    """
    Handles the specific business logic for transforming Otodom listings.
    """
    def __init__(self, cities_path='poland_cities.geojson', districts_path='poland_districts.geojson'):
        """Loads all Polish districts into memory and builds the R-Tree spatial index"""
        try:
            self.cities_gdf = gpd.read_file(cities_path).to_crs(epsg=4326)

            self.districts_gdf = gpd.read_file(districts_path).to_crs(epsg=4326)

        except Exception as e:
            raise RuntimeError(f'FATAL: Spatial truth data failed to load: {e}')

    def get_true_location(self, longitude, latitude) -> tuple[str, str]:
        """
        Pings both R-trees independently to find the true city and true district.
        """
        point = Point(float(longitude), float(latitude))

        city_match = self.cities_gdf[self.cities_gdf.geometry.contains(point)]
        true_city = city_match.iloc[0]['name'] if not city_match.empty else None

        district_match = self.districts_gdf[self.districts_gdf.geometry.contains(point)]
        true_district = district_match.iloc[0]['name'] if not district_match.empty else None

        return true_city, true_district

    def transform(self, raw_doc):
        clean_doc = {'otodom_id': raw_doc.get('otodom_id')}

        location = raw_doc.get('localization', {}).get('location', {})
        coords = raw_doc.get('coordinates', [])

        #the rest of the cleaning logic..

        #spatial logic
        latitude = coords[1]
        longitude = coords[0]
        reported_city = location.get('city', {})
        reported_district = location.get('district', {})

        if pd.notna(latitude) and pd.notna(longitude):
            latitude_f, longitude_f = float(latitude), float(longitude)
            clean_doc['localization_latitude'] = latitude_f
            clean_doc['localization_longitude'] = longitude_f

            clean_doc['location'] = {
                "type": "Point",
                "coordinates": [longitude_f, latitude_f]
            }
            true_city, true_district = self.get_true_location(longitude_f, latitude_f)

            if not true_district:
                clean_doc['district_verified'] = False

            elif (str(reported_district).lower() != str(true_district).lower()) or \
                    (true_city and str(reported_city).lower() != str(true_city).lower()):

                clean_doc['reported_district'] = reported_district
                clean_doc['localization_district'] = true_district

                if true_city:
                    clean_doc['localization_city'] = true_city
                    clean_doc['reported_city'] = reported_city

                clean_doc['district_verified'] = True
            else:
                clean_doc['district_verified'] = True

        else:
            clean_doc['district_verified'] = False

        clean_doc.pop('_id', None)
        return clean_doc