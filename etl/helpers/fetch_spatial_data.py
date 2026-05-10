import requests


def download_poland_cities(output_path="../poland_cities.geojson"):
    print("Requesting national city boundaries from Overpass API (this may take several minutes)...")

    # Overpass QL Query
    query = """
    [out:json][timeout:90];
    // Target only the Lesser Poland Voivodeship (Małopolska)
    area["name"="województwo małopolskie"]["admin_level"="4"]->.searchArea;
    relation["admin_level"="8"]["boundary"="administrative"](area.searchArea);
    out geom;
    """

    url = "https://overpass.kumi.systems/api/interpreter"

    headers = {
        'User-Agent': 'PropertyAnalyticsBot/1.0 (contact: your-email@example.com)',
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    try:
        response = requests.post(url, data={'data': query},headers=headers, stream=True)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Successfully saved to {output_path}")
    except Exception as e:
        print(f"FATAL: Download failed. {e}")


if __name__ == "__main__":
    download_poland_cities()