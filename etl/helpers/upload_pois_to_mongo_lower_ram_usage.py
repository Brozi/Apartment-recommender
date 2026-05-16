# You must install ijson first: pip install ijson pymongo
import pymongo
import ijson
from pymongo import UpdateOne


def stream_upload_to_mongo(merged_json_path, db_uri="mongodb://localhost:27017/"):
    client = pymongo.MongoClient(db_uri)
    db = client["property_analytics"]
    poi_collection = db["pois"]

    # Spatial index declaration
    poi_collection.create_index([("location", "2dsphere")])

    bulk_operations = []
    processed_count = 0

    print("Initiating streaming ingestion. RAM usage will remain stable.")

    # Note: ijson requires opening the file in binary mode ('rb')
    with open(merged_json_path, 'rb') as f:
        # This yields one 'element' at a time without loading the whole file
        elements = ijson.items(f, 'elements.item')

        for el in elements:
            lat = el.get("lat") or el.get("center", {}).get("lat")
            lon = el.get("lon") or el.get("center", {}).get("lon")

            if lat and lon:
                unique_id = f"{el['type']}_{el['id']}"

                # Default safety for tags to prevent NoneType errors
                tags = el.get("tags", {})

                doc = {
                    "osm_id": el["id"],
                    "type": el["type"],
                    "tags": tags,
                    "category": tags.get("amenity") or tags.get("shop") or tags.get("highway") or "other",
                    "location": {
                        "type": "Point",
                        "coordinates": [lon, lat]
                    }
                }

                bulk_operations.append(
                    UpdateOne({"_id": unique_id}, {"$set": doc}, upsert=True)
                )

                processed_count += 1

                # Flush to the database every 10,000 records to prevent memory build-up
                if len(bulk_operations) >= 10000:
                    poi_collection.bulk_write(bulk_operations, ordered=False)
                    print(f"Ingested {processed_count} POIs...")
                    bulk_operations = []  # Reset the batch

    # Final flush for any remaining records
    if bulk_operations:
        poi_collection.bulk_write(bulk_operations, ordered=False)
        print(f"Final batch complete. Total processed: {processed_count}")

# Execution:
# stream_upload_to_mongo("../pois_poland_merged.json")