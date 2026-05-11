import json
import os
import sys
import uuid

current_dir = os.path.dirname(os.path.abspath(__file__))
scraper_dir = os.path.dirname(current_dir)
sys.path.append(scraper_dir)
os.chdir(scraper_dir)

from settings.utils import AVAILABLE_PROVINCES, get_property_type, replace_polish_characters, PROPERTY_TYPE_MAP

PROPERTY_TYPES = list(PROPERTY_TYPE_MAP.keys())
PROPERTY_TYPE_TO_ID = {name: index for index, name in enumerate(PROPERTY_TYPES)}
PROVINCE_TO_ID = {name: index for index, name in enumerate(AVAILABLE_PROVINCES)}

def write_output(name: str, value) -> None:
    if "GITHUB_OUTPUT" not in os.environ:
        return

    delimiter = f"EOF-{uuid.uuid4()}"
    with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
        f.write(f"{name}<<{delimiter}\n")
        f.write(json.dumps(value))
        f.write(f"\n{delimiter}\n")


def normalize_property_types(raw):
    if isinstance(raw, str):
        raw = [raw]

    if not isinstance(raw, list):
        raw = ["flat"]

    result = []
    for item in raw:
        prop = get_property_type(item)
        if prop:
            result.append(prop.name.lower())

    return result or ["flat"]


def normalize_provinces(raw):
    if not isinstance(raw, str):
        return AVAILABLE_PROVINCES

    province = replace_polish_characters(raw.strip()).replace("--", "-")

    if province == "" or province == "cala-polska":
        return AVAILABLE_PROVINCES

    if province not in AVAILABLE_PROVINCES:
        raise ValueError(f"Unknown province: {raw}")

    return [province]


def main():
    with open("settings.json", "r", encoding="utf-8") as f:
        settings = json.load(f)

    crawler = settings["crawler"]

    property_types = normalize_property_types(crawler.get("property_type"))
    provinces = normalize_provinces(crawler.get("province"))

    shards = [
        {"property_type": property_type, "province": province}
        for property_type in property_types
        for province in provinces
    ]

    print(f"Prepared {len(shards)} discovery shards")
    write_output("shards", shards)


if __name__ == "__main__":
    main()
