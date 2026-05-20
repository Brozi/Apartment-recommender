TOKEN_TO_CATEGORY = {
    # Education
    'kindergarten': ('education', 'kindergarten'),
    'school': ('education', 'school'),
    'university': ('education', 'university'),
    'university department': ('education', 'university'),
    'language school': ('education', 'specialized_school'),
    'music school': ('education', 'specialized_school'),
    'driving school': ('education', 'specialized_school'),
    'trade school': ('education', 'specialized_school'),
    'prep school': ('education', 'specialized_school'),
    'ski school': ('education', 'specialized_school'),
    'surf school': ('education', 'specialized_school'),
    'sailing school': ('education', 'specialized_school'),
    'flight school': ('education', 'specialized_school'),
    'maritime school': ('education', 'specialized_school'),
    'cooking school': ('education', 'specialized_school'),
    'dancing school': ('education', 'specialized_school'),
    'pilot school': ('education', 'specialized_school'),

    # Grocery / retail
    'supermarket': ('grocery_retail', 'supermarket'),
    'general': ('grocery_retail', 'general_store'),
    'convenience': ('grocery_retail', 'convenience'),
    'grocery': ('grocery_retail', 'grocery'),
    'grocery store': ('grocery_retail', 'grocery'),
    'bakery': ('grocery_retail', 'bakery'),
    'kiosk': ('grocery_retail', 'kiosk'),
    'alcohol': ('grocery_retail', 'alcohol'),
    'zabka': ('grocery_retail', 'convenience'),

    # Food and drink
    'restaurant': ('food_drink', 'restaurant'),
    'fast food': ('food_drink', 'fast_food'),
    'cafe': ('food_drink', 'cafe'),
    'bar': ('food_drink', 'bar'),
    'food court': ('food_drink', 'food_court'),
    'ice cream': ('food_drink', 'ice_cream'),

    # Transit
    'bus stop': ('bus_stop', 'bus_stop'),
    'tram stop': ('tram_stop', 'tram_stop'),
    'bus station': ('bus_stop', 'bus_station'),
    'stop': ('transit', 'stop'),
    'public transport tickets': ('transit', 'tickets'),
    'shelter': ('transit', 'shelter'),

    # Logistics
    'parcel locker': ('parcel_service', 'parcel_locker'),
    'parcel pickup': ('parcel_service', 'parcel_locker'),
    'post office': ('parcel_service', 'post_office'),
    'post box': ('parcel_service', 'post_box'),

    # Car services
    'parking': ('car_services', 'parking'),
    'fuel': ('car_services', 'fuel'),
    'car wash': ('car_services', 'car_wash'),

    # Health / finance
    'doctors': ('health_finance', 'doctors'),
    'atm': ('health_finance', 'atm'),
    'bureau de change': ('health_finance', 'currency_exchange'),

    # Culture / public
    'library': ('culture_public', 'library'),
    'arts centre': ('culture_public', 'arts_centre'),
    'events venue': ('culture_public', 'events_venue'),
    'fire station': ('culture_public', 'fire_station'),

    # Ignore
    'bench': ('ignore', 'bench'),
    'waste basket': ('ignore', 'waste_basket'),
}