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
    subdistrict = StringField()
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
        reverse_geocoding_raw = properties.get("reverseGeocoding", {}).get("locations", [])
        reverse_geocoding = {item['locationLevel']: item['fullName'] for item in reverse_geocoding_raw}
        self.province = reverse_geocoding.get('name', '')
        self.city = reverse_geocoding.get('city_or_village', '')
        self.district = reverse_geocoding.get('district', '')
        self.street = self.extract_street(properties.get('address', {}))
        self.county = self.extract_county(properties["address"])
        self.latitude, self.longitude = self.extract_coordinates(properties)

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
        county = properties.get("Subregion", "")
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
