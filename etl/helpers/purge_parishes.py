import json


def purge_parishes(input_path, output_path):
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    original_features = data.get("features", [])
    cleaned_features = []

    for feat in original_features:
        props = feat.get("properties", {})

        # Safely extract the name, defaulting to an empty string if missing
        name = props.get("name", "")

        if name:
            # Force to lowercase and strip whitespace to prevent case-mismatch failures
            name_lower = str(name).lower().strip()

            # Drop the feature if it starts with the quarantined word
            if not name_lower.startswith("parafia"):
                cleaned_features.append(feat)
        else:
            # If a neighbourhood has no name, it is useless for presentation,
            # but we keep it here to avoid breaking spatial completeness.
            cleaned_features.append(feat)

    # Overwrite the features list with the purified data
    data["features"] = cleaned_features

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f)

    print(f"Original Count: {len(original_features)}")
    print(f"Purged Count: {len(original_features) - len(cleaned_features)}")
    print(f"Remaining Neighbourhoods: {len(cleaned_features)}")


# Execution
purge_parishes("poland_neighbourhoods_fixed.geojson", "poland_neighbourhoods_cleaned.geojson")