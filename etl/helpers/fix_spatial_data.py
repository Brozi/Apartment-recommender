import json


def fix_broken_rings(input_path="poland_districts.geojson", output_path="poland_districts_fixed.geojson"):
    print("Reading broken GeoJSON as standard text...")
    with open(input_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    valid_features = []
    for feature in data.get("features", []):
        geom = feature.get("geometry")
        if not geom:
            continue

        # Keep only Polygons and MultiPolygons
        if geom.get("type") in ["Polygon", "MultiPolygon"]:
            coords = geom.get("coordinates", [])
            # Manual Ring Closure: Ensure the first and last coordinates match
            if geom["type"] == "Polygon" and len(coords) > 0:
                for ring in coords:
                    if len(ring) >= 3 and ring[0] != ring[-1]:
                        ring.append(ring[0])  # Force the ring closed
            valid_features.append(feature)

    data["features"] = valid_features

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f)
    print(f"Fixed file saved to: {output_path}")


if __name__ == "__main__":
    fix_broken_rings()