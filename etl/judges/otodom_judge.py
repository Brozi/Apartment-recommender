from etl.aggregators import OtodomAggregator

from numpy import exp
from etl.common import NOW

#Take out download functions and put them in a seperate module

class OtodomScoreJudge(OtodomAggregator):
    def __init__(self, listings_col="listings_clean", output_col="listings_clean", agg_col="dashboard_aggregates"):
        super().__init__(listings_col="listings_clean")
        self.output_col = self.db[output_col]
        self.listings_col = self.db[listings_col]
        self.agg_col = self.db[agg_col]
        self.steepness_coef = 10

    def download_aggregates(self, target_period) -> dict:
        metrics = [
            'monthly_market_by_city',
            'monthly_market_by_district',
            'monthly_market_by_district_subdistrict',
        ]
        query = {
            "metric": {"$in": metrics},
            "group_key.period": target_period,
        }
        aggregates_cursor = self.agg_col.find(query)
        aggregates_map = {}

        for doc in aggregates_cursor:
            metric_type = doc.get("metric")
            city = doc.get("group_key", {}).get("city")
            district = doc.get("group_key", {}).get("district")
            subdistrict = doc.get("group_key", {}).get("subdistrict")

            if metric_type == metrics[0]:
                key = (city, None, None)
            elif metric_type == metrics[1]:
                key = (city, district, None)
            elif metric_type == metrics[2]:
                key = (city, district, subdistrict)
            else:
                continue

            aggregates_map[key] = doc

        return aggregates_map

    def calculate_metrics(self, listing: dict, aggregates: dict) -> dict:
        info = self._extract_listing_info(listing)
        local_stats = self.get_best_market_stats(info, aggregates, min_listings=5)

        score_area = self.score_area(info['area'])
        score_rooms = self.score_room(info['rooms'])
        score_build_year = self.score_build_year(info['build_year'])

        median_price = local_stats.get('values',{}).get("med_price", -1)

        if info["price"] > 0 and median_price > 0:
            score_price = self.score_price(info['price'], median_price)
        else:
            score_price = 0.5

        median_price_per_meter = local_stats.get('values', {}).get("med_price_per_meter", -1)

        if info["price_per_meter"] > 0 and median_price_per_meter > 0:
            score_price_per_meter = self.score_price_per_meter(info['price_per_meter'], median_price_per_meter)
        else:
            score_price_per_meter = 0.5

        score_metrics = {
            "computed_at": NOW,
            "price": score_price,
            "price_per_meter": score_price_per_meter,
            "area": score_area,
            "rooms": score_rooms,
            "build_year": score_build_year,
        }

        return score_metrics


    @staticmethod
    def _extract_listing_info(listing: dict) -> dict:
        price = float(listing.get("price", 0))
        price_usable = listing.get("price_usable")
        price_per_meter = float(listing.get("price_per_meter", 0))
        price_per_meter_usable = listing.get("price_per_meter_usable")
        area = float(listing.get("area", 0))
        rooms = listing.get("rooms", 0)
        build_year = listing.get("building", {}).get("build_year", "unknown")
        city = listing.get("localization", {}).get("city", None)
        district = listing.get("localization", {}).get("district", None)
        subdistrict = listing.get("localization", {}).get("neighbourhood", None)
        geo_aggregations = listing.get("geo_aggregations", {})

        return {
            "price": price,
            "price_usable": price_usable,
            "price_per_meter": price_per_meter,
            "price_per_meter_usable": price_per_meter_usable,
            "area": area,
            "rooms": rooms,
            "build_year": build_year,
            "city": city,
            "district": district,
            "subdistrict": subdistrict,
            "geo_aggregations": geo_aggregations,
        }

    @staticmethod
    def _extract_aggregates(aggregation: dict) -> dict:
        values = aggregation.get("values", {})
        med_rooms = values.get("med_rooms", "")
        count = values.get("count", 0)
        avg_price = values.get("avg_price", 0)
        med_price = values.get("med_price", 0)
        avg_price_per_meter = values.get("avg_price_per_meter", 0)
        med_price_per_meter = values.get("med_price_per_meter", 0)
        avg_area = values.get("avg_area", 0)
        med_area = values.get("med_area", 0)

        return {
            "med_rooms": med_rooms,
            "count": count,
            "avg_price": avg_price,
            "med_price": med_price,
            "avg_price_per_meter": avg_price_per_meter,
            "med_price_per_meter": med_price_per_meter,
            "avg_area": avg_area,
            "med_area": med_area,
        }

    @staticmethod
    def get_best_market_stats(
            listing_info: dict,
            aggregates_map: dict,
            min_listings: int = 5
    ) -> dict:

        city = listing_info.get("city")
        district = listing_info.get("district")
        subdistrict = listing_info.get("subdistrict")

        if subdistrict:
            stats = aggregates_map.get((city, district, subdistrict), {})
            if stats and stats.get('values',{}).get("count", 0) >= min_listings:
                return stats

        if district:
            stats = aggregates_map.get((city, district, None), {})
            if stats and stats.get('values',{}).get("count", 0) >= min_listings:
                return stats

        if city:
            stats = aggregates_map.get((city, None, None), {})
            if stats and stats.get('values',{}).get("count", 0) >= min_listings:
                return stats

        return {}

    @staticmethod
    def score_tram(tram_stops:dict) -> float:
        pass


    @staticmethod
    def score_build_year(build_year: str) -> float:
        if build_year == "unknown":
            return 0.5
        build_year = int(build_year)
        match build_year:
            case _ if build_year < 1970:
                return 0.35
            case _ if 1970 <= build_year <= 1990:
                return 0.5
            case _ if 1991 <= build_year <= 2010:
                return 0.7
            case _ if 2011 <= build_year <= 2020:
                return 0.85
            case _ if build_year > 2020:
                return 1.0
            case _:
                return 0.5

    @staticmethod
    def score_area(area: float) -> float:
        match area:
            case _ if area < 25:
                return 0.05
            case _ if 25 <= area <= 40:
                return 0.2
            case _ if 40 <= area <= 60:
                return 0.5
            case _ if 60 <= area <= 80:
                return 0.8
            case _ if area > 80:
                return 1
            case _:
                return 0.5

    @staticmethod
    def score_room(room: str) -> float:
        match room:
            case "unknown":
                return 0.5
            case "1":
                return 0.3
            case "2":
                return 0.6
            case "3":
                return 0.85
            case _:
                return 1


    def score_price(self, price: float, median:float) -> float:
        if median <= 0:
            return 0.5

        rating = self.steepness_coef * ((median - price) / median)
        return 1 / (1 + exp(-rating))

    def score_price_per_meter(self, price_per_meter: float, median:float) -> float:
        if median <= 0:
            return 0.5

        rating = self.steepness_coef * ((median - price_per_meter) / median)
        return 1 / (1 + exp(-rating))






            




