from typing import Any

from mongoengine import EmbeddedDocument
from mongoengine import FloatField
from mongoengine import StringField


class LocalizationDocument(EmbeddedDocument):

    """
    Class representing a property location in the MongoDB database.
    """

    province = StringField(required=True)
    city = StringField(required=True)
    district = StringField()
    street = StringField()
    county = StringField()
    latitude = FloatField()
    longitude = FloatField()

    def extract_data(self, properties: dict):
        """
        Extracts data about localization from already converted JSON
        from the page to the dictionary.

        :param properties: The dict containing the localization information
        """
        locations = properties.get('reverseGeocoding', {}).get('locations', [])
        self.province = locations[0].get('name', '')
        self.city = locations[1].get('name', '')
        self.district = self.extract_district(locations)
        self.street = self.extract_street(properties["address"])
        self.county = self.extract_county(properties["address"])
        self.latitude, self.longitude = self.extract_coordinates(properties)
    @staticmethod
    def extract_district(locations: list) -> str:
        """
        Extracts the district from the properties.

        :param locations: The properties containing the district
        :return: The district
        """
        district = locations[2]
        if isinstance(district, dict):
            district = district.get('name', 'unknown')
        return district

    @staticmethod
    def extract_street(properties: dict) -> str:
        """
        Extracts the street from the properties.

        :param properties: The properties containing the street
        :return: The street
        """
        street = properties.get("street")
        if isinstance(street, dict):
            street = street["name"]
            number = properties.get("number")
            if number is not None:
                street += " " + properties.get("number", "")
        return street

    @staticmethod
    def extract_county(properties: dict) -> str:
        """
        Extracts the county from the properties.

        :param properties: The properties containing the county
        :return: The county
        """
        county = properties.get("county", {})
        if isinstance(county, dict):
            county = county.get("code", "unknown")
        return county

    @staticmethod
    def extract_coordinates(properties: dict) -> tuple[float, float] | tuple[None, None]:
        """
        Extracts the coordinates from the properties.

        :param properties: The property containing the coordinates
        :return: The coordinates
        """
        coordinates = properties.get("coordinates")
        if coordinates is None:
            return None, None
        latitude = coordinates.get("latitude")
        longitude = coordinates.get("longitude")
        return float(latitude), float(longitude)
