import json


def purge_non_polygons(input_path="poland_neighbourhoods.geojson", output_path="poland_neighbourhoods_fixed.geojson"):
    print(f"Loading raw OSM GeoJSON: {input_path}")

    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    original_count = len(data.get("features", []))

    # Forcefully strip out Label Nodes (Points) and border fragments (LineStrings)
    # Keeping ONLY closed areas
    clean_features = [
        feature for feature in data.get("features", [])
        if feature.get("geometry") and feature["geometry"].get("type") in ["Polygon", "MultiPolygon"]
    ]

    data["features"] = clean_features
    new_count = len(data["features"])

    print(f"Purge complete. Destroyed {original_count - new_count} non-polygon features.")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f)

    print(f"Saved strictly polygonal data to: {output_path}")


if __name__ == "__main__":
    purge_non_polygons()