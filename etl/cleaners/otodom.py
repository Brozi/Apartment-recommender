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
        self.clean_market_type(clean_doc)
        self.clean_extras(clean_doc)
        self.clean_security(clean_doc)
        self.clean_heating(clean_doc)
        self.clean_property_type(clean_doc)
        self.clean_photos(clean_doc)
        self.clean_auction_type(clean_doc)
        self.clean_building_type(clean_doc)
        self.clean_building_build_year(clean_doc)
        self.clean_building_floors(clean_doc)

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
        price_per_meter = clean_doc.get('price_per_meter', None)
        area = clean_doc.get('area', 0)
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
            try:
                clean_doc['price'] = price_per_meter * area
                return
            except price <=0:
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

    @staticmethod
    def clean_market_type(clean_doc:dict) -> None:
        market_type_map = {
            'primary': 'Primary',
            'secondary': 'Secondary',
        }
        market_type = clean_doc.get('market_type')
        if market_type is None:
            clean_doc['market_type'] = 'unknown'
            return
        if market_type in market_type_map:
            clean_doc['market_type'] = market_type_map[market_type]
            return

    @staticmethod
    def clean_extras(clean_doc:dict) -> None:
        extras_raw = clean_doc.get('extras')
        if pd.isna(extras_raw) or str(extras_raw).strip().lower() == 'nan' or not extras_raw:
            clean_doc['extras'] = 'unknown'
            return
        extras = str(extras_raw).split(',')

        extras_clean = []
        for extra in extras:
            extra_clean = extra.strip()
            if extra_clean:
                extra_final = extra_clean.replace('_', ' ').title()
                extras_clean.append(extra_final)

        clean_doc['extras'] = extras_clean
        return

    @staticmethod
    def clean_heating(clean_doc:dict) -> None:
        heating_map = {
            'urban': 'Urban',
            'gas': 'Gas',
            'other': 'Other',
            'electrical': 'Electric',
            'boiler_rooms': 'Boiler Room'
        }
        heating_raw = clean_doc.get('heating')
        if heating_raw is None:
            clean_doc['heating'] = 'unknown'
            return

        if heating_raw in heating_map:
            clean_doc['heating'] = heating_map[heating_raw]

    @staticmethod
    def clean_security(clean_doc: dict) -> None:
        security_raw = clean_doc.get('security_types')
        if pd.isna(security_raw) or str(security_raw).strip().lower() == 'nan' or not security_raw:
            clean_doc['security_types'] = 'unknown'
            return
        security_types = str(security_raw).split(',')

        security_types_clean = []
        for security_type in security_types:
            security_clean = security_type.strip()
            if security_clean:
                security_final = security_clean.replace('_', ' ').title()
                security_types_clean.append(security_final)

        clean_doc['security_types'] = security_types_clean
        return

    @staticmethod
    def clean_property_type(clean_doc: dict) -> None:
        property_type = clean_doc.get('property_type')
        if property_type is None:
            clean_doc['property_type'] = 'unknown'
            return
        else:
            clean_doc['property_type'] = property_type.title()
            return

    @staticmethod
    def clean_auction_type(clean_doc: dict) -> None:
        auction_type = clean_doc.get('auction_type')
        if auction_type is None:
            clean_doc['auction_type'] = 'unknown'
            return
        else:
            clean_doc['auction_type'] = auction_type.title()
            return

    @staticmethod
    def clean_photos(clean_doc: dict) -> None:
        photos = clean_doc.get('photo_urls')
        if pd.isna(photos) or str(photos).strip().lower() == 'nan' or not photos:
            clean_doc['photo_urls'] = 'unknown'
            return
        photos = str(photos).split(',')

        photos_clean = []
        for photo in photos:
            photo_clean = photo.strip()
            if photo_clean:
                photos_clean.append(photo_clean)

        clean_doc['photo_urls'] = photos_clean
        return

    @staticmethod
    def clean_building_type(clean_doc: dict) -> None:
        building_type = clean_doc.get('building').get('type', None)
        building = clean_doc['building']
        if building_type is None:
            building['type'] = 'unknown'
            return
        else:
            building['type'] = building_type.title().replace('_', ' ')
            return

    @staticmethod
    def clean_building_build_year(clean_doc: dict) -> None:
        build_year = clean_doc.get('building').get('build_year', None)
        building = clean_doc['building']
        if build_year is None:
            building['build_year'] = 'unknown'
            return
        else:
            if int(build_year) < 1000:
                building['build_year'] = 'unknown'
                return
            building['build_year'] = build_year
            return

    @staticmethod
    def clean_building_floors(clean_doc: dict) -> None:
        floors = clean_doc.get('building').get('floors', None)
        building = clean_doc['building']
        if floors is None:
            building['floors'] = 'unknown'
            return
        else:
            if int(floors) < 0:
                building['build_year'] = 'unknown'
                return
            building['build_year'] = floors
            return









