import requests
import time
import json


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


def download_poland_pois(output_path="../lesser_poland_pois.json"):
    print("Requesting POIs for Lesser Poland from Overpass API (this may take several minutes)...")

    # Native Overpass QL Query
    query = """
    [out:json][timeout:180][maxsize:1073741824];

    // Native area lookup replacing the Overpass Turbo macro
    area["name"="województwo małopolskie"]["admin_level"="4"]->.searchArea;

    (
      // Szkoły podstawowe i ponadpodstawowe
      nwr["amenity"="school"](area.searchArea);

      // Przedszkola
      nwr["amenity"="kindergarten"](area.searchArea);

      // Uczelnie
      nwr["amenity"="university"](area.searchArea);

      // Paczkomaty
      nwr["amenity"="parcel_locker"](area.searchArea);
      nwr["vending"="parcel_pickup"](area.searchArea);

      // Przystanki autobusowe
      nwr["highway"="bus_stop"](area.searchArea);

      // Przystanki tramwajowe
      nwr["railway"="tram_stop"](area.searchArea);

      // Sklepy spożywcze i markety
      nwr["shop"="supermarket"](area.searchArea);
      nwr["shop"="convenience"](area.searchArea);
      nwr["shop"="grocery"](area.searchArea);
    );

    out center;
    """

    url = "https://overpass.kumi.systems/api/interpreter"

    headers = {
        'User-Agent': 'PropertyAnalyticsBot/1.0 (contact: your-email@example.com)',
        'Content-Type': 'application/x-www-form-urlencoded'
    }

    try:
        response = requests.post(url, data={'data': query}, headers=headers, stream=True)
        response.raise_for_status()

        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print(f"Successfully saved to {output_path}")
    except Exception as e:
        print(f"FATAL: Download failed. {e}")


def download_poland_pois_chunked(v_name, output_prefix):
    """
    Downloads POIs in 4 chunks.
    Returns True only if ALL categories succeed.
    """
    print(f"\n--- Starting {v_name} ---")

    categories = {
        "education": 'nwr["amenity"~"school|kindergarten|university"](area.searchArea);',
        "logistics": 'nwr["amenity"="parcel_locker"](area.searchArea); nwr["vending"="parcel_pickup"](area.searchArea);',
        "transit": 'nwr["highway"="bus_stop"](area.searchArea); nwr["railway"="tram_stop"](area.searchArea);',
        "retail": 'nwr["shop"~"supermarket|convenience|grocery"](area.searchArea);'
    }

    url2 = "https://overpass-api.de/api/interpreter"
    url = "https://overpass.kumi.systems/api/interpreter"
    headers = {
        # CRITICAL: Replace with your actual email or you will be blocked again
        'User-Agent': 'PropertyAnalyticsBot/1.2 (contact: kuba.mleczny@gmail.com)',
        'Accept': 'application/json'
    }

    all_success = True

    for name, filters in categories.items():
        output_file = f"{output_prefix}_{name}.json"

        # Skip category if already exists
        if os.path.exists(output_file):
            print(f"  Category '{name}' already exists. Skipping.")
            continue

        print(f"  Requesting {name}...")
        query = f"""
        [out:json][timeout:180];
        area["name"="{v_name}"]["admin_level"="4"]->.searchArea;
        ({filters});
        out center;
        """

        try:
            # Check slot status right before the request
            # while not check_overpass_status():
            #     print("  Waiting for a free server slot...")
            #     time.sleep(30)

            response = requests.post(url, data={'data': query}, headers=headers)
            response.raise_for_status()

            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(response.json(), f, ensure_ascii=False, indent=2)

            print(f"  Saved: {output_file}")
            time.sleep(15)  # Safety gap between categories

        except Exception as e:
            print(f"  FAILED {name}: {e}")
            all_success = False
            break  # Stop this voivodeship if a chunk fails

    return all_success


import time
import requests
import os

VOIVODESHIPS = [
    "województwo dolnośląskie", "województwo kujawsko-pomorskie",
    "województwo lubelskie", "województwo lubuskie",
    "województwo łódzkie", "województwo małopolskie",
    "województwo mazowieckie", "województwo opolskie",
    "województwo podkarpackie", "województwo podlaskie",
    "województwo pomorskie", "województwo śląskie",
    "województwo świętokrzyskie", "województwo warmińsko-mazurskie",
    "województwo wielkopolskie", "województwo zachodniopomorskie"
]


def check_overpass_status():
    """Checks the status endpoint to see if slots are available."""
    status_url2 = "https://overpass-api.de/api/status"
    status_url = "https://overpass.kumi.systems/api/status"

    # The status ping MUST identify itself, just like the main query
    headers = {
        'User-Agent': 'PropertyAnalyticsBot/1.2 (contact: kuba.mleczny@gmail.com)'
    }

    try:
        response = requests.get(status_url, headers=headers, timeout=10)
        response.raise_for_status()  # Force an exception if the server rejects the request

        text = response.text.lower()

        # 'available now' is more reliable than 'slot available now' across API versions
        if "available now" in text:
            return True
        else:
            # Server is responding normally, but slots are full
            print("  [Server message]: No slots available yet. Waiting...")
            return False

    except requests.exceptions.RequestException as e:
        # Stop failing silently. Print the actual network rejection.
        print(f"  [Status Check Failed]: {e}")
        return False


def run_national_extraction(output_dir="../pois"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    for v_name in VOIVODESHIPS:
        # Create a clean prefix: ../data/mazowieckie
        safe_name = v_name.replace("województwo ", "").replace(" ", "_").replace("ł", "l").replace("ó", "o").replace("ś", "s").replace("ą", "a").replace("ę", "e").replace("ż", "z").replace("ź", "z").replace("ć", "c").replace("ń", "n")
        output_prefix = os.path.join(output_dir, safe_name)

        # Check if we have all 4 files already
        expected_files = [f"{output_prefix}_{cat}.json" for cat in ["education", "logistics", "transit", "retail"]]
        if all(os.path.exists(f) for f in expected_files):
            print(f"Skipping {v_name}: All categories already downloaded.")
            continue

        # Execute the downloader
        success = download_poland_pois_chunked(v_name, output_prefix)

        if success:
            print(f"Completed {v_name} successfully.")
            print("Cooling down for 60s before next voivodeship...")
            time.sleep(60)
        else:
            print(f"Incomplete data for {v_name}. Moving to next or retry later.")

if __name__ == "__main__":
    print("Starting national POI extraction pipeline...")
    run_national_extraction()