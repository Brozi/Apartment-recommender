from models.property import PropertyDocument
from models.building import BuildingDocument
from models.localization import LocalizationDocument
from common.constans import Constans, OfferedBy, PropertyType, MarketType, AuctionType, ConstructionStatus, NOW
from services.property import PropertyService
import logging
import re

logger = logging.getLogger(__name__)


class InvestmentMapper:
    """
    Responsible for mapping raw JSON dictionary payloads from the Next.js API
    into application-specific MongoDB Document models.

    This class is pure and does not make network requests or maintain state.
    """
    @staticmethod
    def map_investment_unit(unit_dict: dict, investment_dict: dict) -> PropertyDocument | None:
        """
        Maps a single unit's JSON dictionary to a PropertyDocument.

        Uses the main_location from the parent investment to fill in missing
        street or district data if the unit lacks specific localization.

        Args:
            unit_dict (dict): The raw JSON dictionary representing the apartment unit.
            investment_dict (dict): The raw JSON dictionary representing the main investment page

        Returns:
            PropertyDocument | None: The fully mapped MongoDB document, or None if mapping fails or document already exists.
        """
        investment_url = investment_dict.get("url", "")
        path = unit_dict.get("url", "")
        full_url = f"{Constans.DEFAULT_URL}{path}" if path.startswith("/") else path

        raw_id = (
                unit_dict.get("id") or unit_dict.get("adId") or
                unit_dict.get("externalId") or unit_dict.get("target", {}).get("Id")
        )

        if not raw_id and full_url:
            m = re.search(r"(ID[0-9A-Za-z]+)$", full_url)
            raw_id = m.group(1) if m else None

        if not raw_id:
            return None

        otodom_id = str(raw_id)
        if PropertyService.get_by_otodom_id(int(otodom_id)):
            return None

        try:
            property_ = PropertyDocument()
            property_.link = full_url
            property_.otodom_id = otodom_id
            property_.created_at = investment_dict.get("createdAt")
            property_.description = investment_dict.get("description")
            property_.title = InvestmentMapper._convert_url_to_title(investment_url, full_url)
            property_.developer_id = int(investment_dict.get("owner", {}).get("id", 0))

            characteristics = unit_dict.get('characteristics', [])
            target_data = {item['key']: item['value'] for item in characteristics}

            area_val = target_data.get('m', 0.0)
            property_.area = float(area_val)

            rooms = target_data.get('rooms_num', '')
            property_.rooms = rooms

            property_.price = target_data.get('price')
            property_.price_per_meter = target_data.get('price_per_m')

            investment_ad = investment_dict.get('props', {}).get('pageProps', {}).get('ad', {})
            additional_info_list = investment_ad.get('additionalInformation', [])
            additional_info = {item['label']: item['values'] for item in additional_info_list}

            extras_list = additional_info.get("project_amenities", [])
            property_.extras = ", ".join(extras_list)

            security_list = additional_info.get("security", [])
            property_.security_types = ", ".join(security_list)

            property_.heating = target_data.get("heating", '')

            floor_no = target_data.get("floor_no", '')
            property_.floor = str(floor_no).replace("floor_", "").replace("ground_floor", "0")

            property_.building = InvestmentMapper._map_building(target_data)

            property_.offered_by = OfferedBy.DEVELOPER_UNIT
            property_.market_type = MarketType.PRIMARY
            property_.auction_type = AuctionType.SALE
            property_.property_type = PropertyType.FLAT

            status = target_data.get("construction_status", '')
            try:
                property_.construction_status = ConstructionStatus(status)
            except ValueError:
                pass

            images = unit_dict.get("floorPlans", [])
            photo_urls = images
            property_.photos = ", ".join(filter(None, photo_urls))
            property_.localization = InvestmentMapper._map_localization(target_data)
            property_.etl_processed = False
            property_.scraped_at = NOW.isoformat()

            logger.info(f" Saved Unit directly from JSON: {property_.link}")
            PropertyService.put(property_)
            return property_

        except Exception as e:
            logger.error(f"Failed to map JSON for unit {full_url}: {e}")
            return None

    @staticmethod
    def _map_building(characteristics: dict) -> BuildingDocument:
        """
        Extracts building-specific metadata from the target dictionary.

        Args:
            characteristics (dict): The 'characteristics' dictionary from the investment units page.

        Returns:
            BuildingDocument: A populated document containing building year, type, floors, etc.
        """
        building = BuildingDocument()
        building.build_year = characteristics.get("build_year", "")
        b_types = characteristics.get("building_type", "")
        building.type = b_types if b_types else None
        b_floors = characteristics.get("building_floors_num", "")
        building.floors = int(b_floors) if b_floors else None
        b_ownership = characteristics.get("building_ownership", "")
        building.ownership = b_ownership if b_ownership else None
        return building

    @staticmethod
    def _map_localization(investment_ad_data: dict) -> LocalizationDocument:
        """
        Extracts the units geolocation. Due to changes in Otodom structure,
        the function needs to rely on the main investment's location

        Args:
            investment_ad_data (dict): The 'ad' nested dictionary from the Otodom unit JSON.

        Returns:
            LocalizationDocument: The fully resolved location with GPS coordinates.
        """

        loc = LocalizationDocument()
        location = investment_ad_data.get("location", {})
        reverse_geocoding_raw = investment_ad_data.get("reverseGeocoding", {}).get("locations", [])
        reverse_geocoding = {item['locationLevel']: item['fullName'] for item in reverse_geocoding_raw}
        if location and isinstance(location, dict):
            county_raw = investment_ad_data.get("Subregion", "")
            address = location.get("address", {})
            loc.street = (address.get("street",{})).get("name")
            loc.district = reverse_geocoding.get('district', '')
            loc.city = reverse_geocoding.get('city_or_village', '')
            loc.county = county_raw.replace("powiat-", "").capitalize()
            loc.province = reverse_geocoding.get('voivodeship', '')

        unit_loc = location
        coordinates = unit_loc.get('coordinates', {})
        if coordinates:
            loc.latitude = float(coordinates.get('latitude', coordinates.get('lat', 0.0)))
            loc.longitude = float(coordinates.get('longitude', coordinates.get('lon', 0.0)))

        if loc.longitude and loc.latitude:
            loc.location = [loc.longitude, loc.latitude]

        return loc

    @staticmethod
    def _convert_url_to_title(investment_url: str, unit_url: str)-> str:
        investment_code = investment_url.rsplit("-", 1)[0]
        title = unit_url.split(f"{Constans.DEFAULT_URL}/pl/oferta", 1)[0].rsplit(f"{investment_code}", 1)[0]
        return title
