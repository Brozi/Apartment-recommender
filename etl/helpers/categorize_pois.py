import re

from etl.helpers.token_to_category import TOKEN_TO_CATEGORY

def categorize_poi(tags):
    raw_values = _extract_relevant_values(tags)
    tokens = _tokenize_values(raw_values)

    #Specific tag-aware rules first
    if tags.get('amenity') == 'parcel_locker' or tags.get('vending') == 'parcel_pickup':
        return _result(
            group='logistics',
            detail='parcel_locker',
            raw_values=raw_values,
            groups=['logistics'],
        )

    matched = []

    for token in tokens:
        match = TOKEN_TO_CATEGORY.get(token)
        if match:
            matched.append(match)

    if not matched:
        return _result(
            group='unknown',
            detail='unknown',
            raw_values=raw_values,
            groups=['unknown'],
        )

    groups = sorted({group for group, _detail in matched})
    primary_group, primary_detail = _choose_primary_category(matched)

    return _result(
        group=primary_group,
        detail=primary_detail,
        raw_values=raw_values,
        groups=groups,
    )

def _extract_relevant_values(tags):
    values = []

    for key in (
        'amenity',
        'shop',
        'highway',
        'railway',
        'public_transport',
        'vending',
        'brand',
        'operator',
        'name',
    ):
        value = tags.get(key)
        if value:
            values.append(str(value))

    return values

def _tokenize_values(values):
    tokens = []

    for value in values:
        normalized = value.replace('_', ' ').lower()
        normalized = normalized.replace('ż', 'z')

        for part in re.split(r'[;,/]+', normalized):
            part = part.strip()
            if part:
                tokens.append(part)
    return tokens


def _choose_primary_category(matches):
    priority = [
        'education',
        'grocery_retail',
        'transit',
        'logistics',
        'food_drink',
        'health_finance',
        'car_services',
        'culture_public',
        'ignore',
        'unknown',
    ]

    for group in priority:
        for matched_group, detail in matches:
            if matched_group == group:
                return matched_group, detail

    return matches[0]

def _result(group, detail, raw_values, groups):
    return {
        'category_group': group,
        'category': detail,
        'category_groups': groups,
        'raw_category': ';'.join(raw_values) if raw_values else None,
    }
