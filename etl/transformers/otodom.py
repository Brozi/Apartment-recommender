import logging
import json

import pandas as pd
import geopandas as gpd
import copy

from pathlib import Path
from shapely.geometry import shape, Point
from shapely.validation import make_valid

from etl.cleaners import OtodomCleaner

logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class OtodomTransformer:
    """
    Handles the specific business logic for transforming Otodom listings.
    """
    def __init__(self, cities_filename='poland_cities.geojson', districts_filename='poland_districts_fixed.geojson',
                 neighbourhoods_filename='poland_neighbourhoods.geojson'):
        """Loads all Polish districts into memory and builds the R-Tree spatial index"""
        cities_path = BASE_DIR / cities_filename
        districts_path = BASE_DIR / districts_filename
        neighbourhoods_path = BASE_DIR / neighbourhoods_filename

        self.cities_gdf = self.load_cities(cities_path)
        self.districts_gdf = self.load_districts(districts_path)

        self.cleaner = OtodomCleaner(get_true_location=self.get_true_location)


    def transform(self, raw_doc: dict, price_threshold=None) -> dict:
        clean_doc = copy.deepcopy(raw_doc)
        clean_doc.pop('_id', None)

        self.cleaner.clean(clean_doc, price_threshold)

        return clean_doc


    def get_true_location(self, longitude:float, latitude:float) -> tuple[str, str]:
        """
        Pings both R-trees independently to find the true city and true district.
        """
        point = Point(float(longitude), float(latitude))

        city_match = self.cities_gdf[self.cities_gdf.geometry.contains(point)]
        true_city = city_match.iloc[0]['JPT_NAZWA_'] if not city_match.empty else None

        district_match = self.districts_gdf[self.districts_gdf.geometry.contains(point)]
        if not district_match.empty:
            true_district = district_match.iloc[0]['name']
        else:
            true_district = true_city

        return true_city, true_district

    @staticmethod
    def load_cities(cities_path) -> gpd.GeoDataFrame:
        if not cities_path.exists():
            raise FileNotFoundError(f"CRITICAL: City data missing at {cities_path}")

        try:
            # 1. Load Cities normally (Government data is topologically sound)
            logger.info("Loading national city boundaries...")
            cities_gdf = gpd.read_file(str(cities_path)).to_crs(epsg=4326)
            cities_gdf = cities_gdf[['JPT_NAZWA_', 'geometry']]
            return cities_gdf

        except Exception as e:
            raise RuntimeError(f"FATAL: Spatial truth data failed to load: {e}")

    @staticmethod
    def load_districts(districts_path) -> gpd.GeoDataFrame:
        if not districts_path.exists():
            raise FileNotFoundError(f"CRITICAL: District data missing at {districts_path}")

        # 2. BULLETPROOF DISTRICT LOADER
        logger.info("Loading and repairing OSM districts feature-by-feature...")
        with open(str(districts_path), 'r', encoding='utf-8') as f:
            raw_data = json.load(f)

        valid_rows = []
        valid_geometries = []
        failed_count = 0

        for feature in raw_data.get('features', []):
            try:
                geom_dict = feature.get('geometry')
                if not geom_dict:
                    continue

                # Convert raw JSON dict to a Shapely object
                raw_shape = shape(geom_dict)

                # If it's broken, force a mathematical repair
                if not raw_shape.is_valid:
                    raw_shape = make_valid(raw_shape)

                # make_valid can sometimes splinter a broken polygon into lines/points.
                # We MUST filter those out, or the R-Tree contains() will fail.
                if raw_shape.geom_type in ['Polygon', 'MultiPolygon']:
                    # Keep only the name and the valid shape
                    props = feature.get('properties', {})
                    valid_rows.append({'name': props.get('name', 'Unknown')})
                    valid_geometries.append(raw_shape)
                else:
                    failed_count += 1

            except Exception:
                # If a feature is so corrupted Shapely can't even read it, silently drop it.
                failed_count += 1
                continue

        logger.info(
            f"District load complete. Successfully repaired {len(valid_rows)} features. Quarantined/Dropped {failed_count} unfixable features.")

        # 3. Manually construct the GeoDataFrame from the surviving data
        df = pd.DataFrame(valid_rows)
        districts_gdf = gpd.GeoDataFrame(df, geometry=valid_geometries, crs="EPSG:4326")

        return districts_gdf

    @staticmethod
    def load_neighbourhoods(neighbourhoods_path) -> gpd.GeoDataFrame:
        if not neighbourhoods_path.exists():
            raise FileNotFoundError(f"CRITICAL: Neighbourhood data missing at {neighbourhoods_path}")






