from etl.services import connect_to_database

class OtodomAggregator:
    """
    This class is a template class for the aggregators.
    Attributes:
        db (MongoClient object): The MongoClient object with the database
        listings_col: The collection containing the listings that the aggregations are going to be performed on.
        Can be treated as an input collection.
        market_type: the string "market_type" for easier usage in OtodomDashAggregator
        auction_type: the string "auction_type" for easier usage in OtodomDashAggregator
        offered_by: the string "offered_by" for easier usage in OtodomDashAggregator
        floor: the string "floor" for easier usage in OtodomDashAggregator
        construction_status: the string "construction_status" for easier usage in OtodomDashAggregator
        rooms: the string "rooms" for easier usage in OtodomDashAggregator

    """
    def __init__(self, db_name='otodom_data', listings_col='listings_clean'):
        self.db = connect_to_database()[db_name]
        self.listings_col = self.db[listings_col]
        self.market_type = 'market_type'
        self.auction_type = 'auction_type'
        self.offered_by = 'offered_by'
        self.floor = 'floor'
        self.construction_status = 'construction_status'
        self.rooms = 'rooms'
        self.build_year = 'building.build_year'