import logging
from pymongo import UpdateOne

from etl.aggregators import OtodomAggregator
from etl.common import NOW

logger = logging.getLogger(__name__)

class OtodomFilterLimitsAggregator(OtodomAggregator):
    def __init__(
            self,
            listings_col="listings_clean",
            filter_limits_col="filter_limits",
    ):
        super().__init__(listings_col="listings_clean")
        self.filter_limits_col = self.db[filter_limits_col]
        self.listings_col = self.db[listings_col]

    def run(self):
        updated_count = self.build_filter_limits()
        logger.info(f"Updated {updated_count} scope(s)")

    def build_filter_limits(self) -> int:
        docs = list(self.listings_col.aggregate(self._filter_limits_pipeline()))
        operations = [self._build_upsert_operation(doc) for doc in docs]

        if not operations:
            return 0

        self.filter_limits_col.bulk_write(operations, ordered=False)
        return len(operations)

    def _filter_limits_pipeline(self) -> list[dict]:
        return [
            {
                "$project": {
                    "price": 1,
                    "price_usable": 1,
                    "price_per_meter": 1,
                    "price_per_meter_usable": 1,
                    "area": 1,
                    "area_usable": 1,
                    "build_year": {
                        "$convert": {
                            "input": f"${self.build_year}",
                            "to": "int",
                            "onError": None,
                            "onNull": None,
                        }
                    },
                }
            },
            {
                "$match": {
                    "price_usable": True,
                    "price_per_meter_usable": True,
                    "build_year": {"$ne": None},
                }
            },
            {
                "$group": {
                    "_id": None,
                    "lower_price": {"$min": "$price"},
                    "upper_price": {"$max": "$price"},
                    "lower_price_per_meter": {"$min": "$price_per_meter"},
                    "upper_price_per_meter": {"$max": "$price_per_meter"},
                    "lower_area": {"$min": "$area"},
                    "upper_area": {"$max": "$area"},
                    "lower_build_year": {"$min": "$build_year"},
                    "upper_build_year": {"$max": "$build_year"},
                    "listing_count": {"$sum": 1},
                }
            },
        ]

    @staticmethod
    def _build_upsert_operation(doc: dict) -> UpdateOne:

        return UpdateOne(
            {
                "_id": "global"
            },
            {
                "$set": {
                    "limits":{
                        "price": {
                            "lower": doc["lower_price"],
                            "upper": doc["upper_price"],
                        },
                        "price_per_meter": {
                            "lower": doc["lower_price_per_meter"],
                            "upper": doc["upper_price_per_meter"],
                        },
                        "area": {
                            "lower": doc["lower_area"],
                            "upper": doc["upper_area"],
                        },
                        "build_year": {
                            "lower": doc["lower_build_year"],
                            "upper": doc["upper_build_year"],
                        },
                    },
                    "listing_count": doc["listing_count"],
                    "computed_at": NOW
                }
            },
            upsert=True,
        )