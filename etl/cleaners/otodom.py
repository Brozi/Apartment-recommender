import pandas as pd

class OtodomCleaner:
    def __init__(self, get_true_location):
        self.get_true_location = get_true_location
    def clean(self, clean_doc: dict, price_threshold:float|None=None) -> None:

        self.clean_rooms(clean_doc)
        self.clean_floor(clean_doc)
        self.clean_rent(clean_doc)
        self.clean_price_per_meter(clean_doc)
        self.clean_price(clean_doc, price_threshold)
        self.clean_localization(clean_doc)
        self.clean_construction_status(clean_doc)
        self.clean_offered_by(clean_doc)

    def clean_localization(self, clean_doc: dict) -> None:
        localization = clean_doc.get('localization', {})

        latitude = localization.get('latitude')
        longitude = localization.get('longitude')

        reported_city = localization.get('city', None)
        reported_district = localization.get('district', None)

        # spatial logic
        if pd.notna(latitude) and pd.notna(longitude):
            latitude_f, longitude_f = float(latitude), float(longitude)

            clean_doc['geo_location'] = {
                'type': 'Point',
                'coordinates': [longitude_f, latitude_f]
            }

            true_city, true_district, true_neighbourhood = self.get_true_location(longitude_f, latitude_f)

            if true_city:
                localization['city'] = true_city
                localization['district'] = true_district
                localization['neighbourhood'] = true_neighbourhood

                city_match = str(reported_city).lower() == str(true_city).lower()
                district_match = str(reported_district).lower() == str(
                    true_district).lower() if reported_district else True

                localization['verified'] = True
                clean_doc['listing_data_accurate'] = city_match and district_match
            else:
                localization['verified'] = False
        else:
            localization['verified'] = False


    @staticmethod
    def clean_rent(clean_doc: dict, min_rent: int = 20) -> None:
        rent_raw = clean_doc.get('rent')
        if rent_raw is None:
            clean_doc['rent'] = None
            clean_doc['rent_usable'] = False
            clean_doc['rent_raw'] = rent_raw
            return

        try:
            rent = int(rent_raw)
            clean_doc['rent'] = rent
            clean_doc['rent_usable'] = True
        except (TypeError, ValueError):
            clean_doc['rent'] = None
            clean_doc['rent_usable'] = False
            clean_doc['rent_raw'] = rent_raw
            return

        if rent < min_rent:
            clean_doc['rent'] = None
            clean_doc['rent_usable'] = False
            clean_doc['rent_raw'] = rent
            return
        else:
            clean_doc['rent'] = rent
            clean_doc['rent_usable'] = True
            return

    @staticmethod
    def clean_price_per_meter(clean_doc: dict) -> None:
        price_per_meter = clean_doc.get('price_per_meter', None)
        area = clean_doc.get('area', 0)
        price = clean_doc.get('price', 0)

        if price_per_meter is None or price_per_meter == 0:
            try:
                price_per_meter = price / area
                if price_per_meter == 0:
                    clean_doc['price_per_meter'] = None
                    clean_doc['price_per_meter_usable'] = False
                    return
                else:
                    clean_doc['price_per_meter'] = price_per_meter
                    clean_doc['price_per_meter_usable'] = True
                    return
            except ZeroDivisionError:
                clean_doc['price_per_meter'] = None
                return
        else:
            clean_doc['price_per_meter'] = price_per_meter
            clean_doc['price_per_meter_usable'] = True
            return

    @staticmethod
    def clean_floor(clean_doc: dict) -> None:
        floor = clean_doc.get('floor', None)
        floor_map = {
            '0': 'Ground Floor',
            'higher_10': '10+',
            'cellar': 'Basement',
            'garret': 'Attic',
            '<10': 'unknown',
        }
        if floor is None:
            clean_doc['floor'] = 'unknown'
            return

        floor = str(floor)

        if floor.endswith(".0"):
            floor = floor[:-2]

        mapped = floor_map.get(floor)
        if mapped is not None:
            clean_doc['floor'] = mapped
            return
        try:
            clean_doc['floor'] = str(int(floor))
        except (TypeError, ValueError):
            clean_doc['floor'] = floor
            return

    @staticmethod
    def clean_construction_status(clean_doc: dict) -> None:
        construction_status = clean_doc.get('construction_status')
        if construction_status is None:
            clean_doc['construction_status'] = 'unknown'
            return
        construction_status_map = {
            'to_renovation': 'To Renovation',
            'to_completion': 'To Completion',
            'ready_to_use': 'Ready to Use',
        }
        if construction_status in construction_status_map:
            clean_doc['construction_status'] = construction_status_map.get(construction_status)
            return

    @staticmethod
    def clean_rooms(clean_doc: dict) -> None:
        rooms = clean_doc.get('rooms', None)
        if rooms is None:
            clean_doc['rooms'] = 'unknown'
            return

        rooms_str = str(rooms).strip()
        rooms_map = {
            'more': '10+'
        }

        if rooms_str in rooms_map:
            clean_doc['rooms'] = rooms_map[rooms_str]
            return
        try:
            clean_doc['rooms'] = str(int(float(rooms_str)))
            return
        except (TypeError, ValueError):
            clean_doc['rooms'] = rooms_str
            return

    @staticmethod
    def clean_price(clean_doc:dict, threshold:float|None=None):
        value_raw = clean_doc.get('price')
        if value_raw is None:
            clean_doc['price'] = None
            clean_doc['price_usable'] = False
            return
        try:
            clean_doc['price'] = int(value_raw)
            price = clean_doc['price']
        except (TypeError, ValueError):
            clean_doc['price'] = None
            clean_doc['price_usable'] = False
            return

        if price <= 0:
            clean_doc['price'] = None
            clean_doc['price_usable'] = False
            return

        if price < 50000:
            clean_doc['price'] = None
            clean_doc['price_usable'] = False
            return

        elif threshold is not None and price <= threshold:
            clean_doc['price'] = price
            clean_doc['price_usable'] = False
            return

        clean_doc['price'] = price
        clean_doc['price_usable'] = True
        return

    @staticmethod
    def clean_offered_by(clean_doc: dict) -> None:
        offered_by_map = {
            'developer_unit': 'Developer',
            'agency': 'Agency',
            'private': 'Private',

        }
        offered_by = clean_doc.get('offered_by')
        if offered_by is None:
            clean_doc['offered_by'] = 'unknown'
            return
        if offered_by in offered_by_map:
            clean_doc['offered_by'] = offered_by_map[offered_by]
            return



