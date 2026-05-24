from etl.services import connect_to_database

class OtodomAggregator:
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
        self.building_type = 'building.type'