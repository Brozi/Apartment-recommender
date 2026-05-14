import time
import requests
import os
import json
from collections import deque

# --- CONFIGURATION ---
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

CATEGORIES = {
    "education": 'nwr["amenity"~"school|kindergarten|university"](area.searchArea);',
    "logistics": 'nwr["amenity"="parcel_locker"](area.searchArea); nwr["vending"="parcel_pickup"](area.searchArea);',
    "transit": 'nwr["highway"="bus_stop"](area.searchArea); nwr["railway"="tram_stop"](area.searchArea);',
    "retail": 'nwr["shop"~"supermarket|convenience|grocery"](area.searchArea);'
}

# The mirrors we will rotate through
MIRRORS = [
    {"api": "https://overpass-api.de/api/interpreter", "status": "https://overpass-api.de/api/status"},
    {"api": "https://lz4.overpass-api.de/api/interpreter", "status": "https://lz4.overpass-api.de/api/status"},
    {"api": "https://overpass.kumi.systems/api/interpreter", "status": "https://overpass.kumi.systems/api/status"}
]

HEADERS = {
    'User-Agent': 'PropertyAnalyticsBot/1.3 (contact: kuba.mleczny@gmail.com)',
    'Accept': 'application/json'
}


# --- HELPERS ---

def get_safe_name(v_name):
    replacements = {
        "województwo ": "", " ": "_", "ł": "l", "ó": "o", "ś": "s",
        "ą": "a", "ę": "e", "ż": "z", "ź": "z", "ć": "c", "ń": "n"
    }
    name = v_name.lower()
    for k, v in replacements.items():
        name = name.replace(k, v)
    return name


def check_mirror_status(status_url):
    try:
        response = requests.get(status_url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return "available now" in response.text.lower()
    except:
        return False


# --- CORE LOGIC ---

def download_task(v_name, cat_name, filter_query, output_path, mirror, timeout=180):
    """Downloads a single category for a single voivodeship."""
    query = f"""
    [out:json][timeout:{timeout}][maxsize:1073741824];
    area["name"="{v_name}"]["admin_level"="4"]->.searchArea;
    ({filter_query});
    out center;
    """

    try:
        response = requests.post(mirror['api'], data={'data': query}, headers=HEADERS, timeout=timeout + 10)
        response.raise_for_status()

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(response.json(), f, ensure_ascii=False, indent=2)

        return "SUCCESS"

    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 504: return "TIMEOUT"
        if e.response.status_code == 429: return "RATE_LIMIT"
        return f"ERROR_{e.response.status_code}"
    except Exception as e:
        return str(e)


def run_national_extraction(output_dir="../pois"):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # 1. Initialize Task Queue
    task_queue = deque()
    for v_name in VOIVODESHIPS:
        prefix = os.path.join(output_dir, get_safe_name(v_name))
        for cat_name, filters in CATEGORIES.items():
            path = f"{prefix}_{cat_name}.json"
            if not os.path.exists(path):
                task_queue.append({
                    "v_name": v_name,
                    "cat_name": cat_name,
                    "filters": filters,
                    "path": path,
                    "retries": 0
                })

    print(f"Total tasks to process: {len(task_queue)}")

    failed_tasks = []
    mirror_idx = 0

    # 2. Main Loop
    while task_queue:
        task = task_queue.popleft()
        mirror = MIRRORS[mirror_idx % len(MIRRORS)]

        print(f"\n[QUEUE: {len(task_queue)}] {task['v_name']} - {task['cat_name']}...")
        print(f"  Using Mirror: {mirror['api']}")

        result = download_task(
            task['v_name'],
            task['cat_name'],
            task['filters'],
            task['path'],
            mirror,
            timeout=180 if task['retries'] == 0 else 360  # Double timeout for retries
        )

        if result == "SUCCESS":
            print(f"  SUCCESS: Saved to {os.path.basename(task['path'])}")
            # Only rotate mirrors on success or busy to balance load
            mirror_idx += 1
            time.sleep(10)  # Safety gap

        elif result in ["TIMEOUT", "RATE_LIMIT", "BUSY"]:
            print(f"  {result}: Mirror saturated or query too heavy. Re-queueing...")
            task['retries'] += 1

            if task['retries'] > 3:
                print(f"  !! CRITICAL: Task failed 3 times. Moving to final failure list.")
                failed_tasks.append(task)
            else:
                # Put it back at the end of the queue to try later (possibly with a different mirror)
                task_queue.append(task)
                # Rotate mirror to try a fresh one
                mirror_idx += 1
                time.sleep(30)  # Wait longer if we are hitting limits
        else:
            print(f"  FATAL ERROR: {result}. Skipping this task.")
            failed_tasks.append(task)

    # 3. Final Summary
    print("\n" + "=" * 30)
    print("EXTRACTION FINISHED")
    if failed_tasks:
        print(f"Failed Tasks ({len(failed_tasks)}):")
        for ft in failed_tasks:
            print(f" - {ft['v_name']} | {ft['cat_name']}")
    else:
        print("All tasks completed successfully!")
    print("=" * 30)


if __name__ == "__main__":
    print("Starting National POI Extraction Pipeline (Mirror-Rotating Edition)...")
    run_national_extraction()