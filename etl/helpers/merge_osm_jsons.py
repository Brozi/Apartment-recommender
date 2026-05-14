import json
import glob
import os


def merge_national_osm_jsons(input_directory="../pois", output_filename="../poland_merged.json"):
    print(f"Initiating national JSON merge from '{input_directory}'...")

    # Broaden the search to catch ALL voivodeships and categories, using the correct .json extension
    file_pattern = os.path.join(input_directory, "*.json")
    files_to_merge = glob.glob(file_pattern)

    # CRITICAL: Prevent the script from attempting to merge its own previous output
    files_to_merge = [f for f in files_to_merge if os.path.abspath(f) != os.path.abspath(output_filename)]

    if not files_to_merge:
        print("FATAL: No .json files found. Check your directory path and extraction pipeline.")
        return

    print(f"Found {len(files_to_merge)} chunk files to process. This will consume significant RAM...")

    unique_elements = {}

    base_structure = {
        "version": 0.6,
        "generator": "National POI Pipeline",
        "elements": []
    }

    for filepath in files_to_merge:
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                data = json.load(f)

                # Extract the elements array safely
                elements = data.get("elements", [])

                # Counter for logging
                added = 0

                for element in elements:
                    element_type = element.get("type")
                    element_id = element.get("id")

                    if element_type and element_id:
                        composite_key = f"{element_type}_{element_id}"
                        # This automatically deduplicates overlapping POIs across voivodeship borders
                        if composite_key not in unique_elements:
                            unique_elements[composite_key] = element
                            added += 1

                print(f"Parsed {os.path.basename(filepath)} - Extracted {added} unique new elements.")

        except json.JSONDecodeError:
            print(f"  [ERROR] {filepath} is corrupted or empty. Skipping.")
        except Exception as e:
            print(f"  [ERROR] Failed to process {filepath}: {e}")

    # Transfer dictionary values to the final list
    print("\nFlattening deduplicated dictionary into JSON array...")
    base_structure["elements"] = list(unique_elements.values())

    # Clear the dictionary from memory before the heavy file write operation
    del unique_elements

    print(f"Merge complete. Final dataset contains {len(base_structure['elements'])} unique POIs across Poland.")
    print(f"Writing unified multi-gigabyte dataset to {output_filename}... (Do not interrupt)")

    with open(output_filename, 'w', encoding='utf-8') as f:
        # Removing 'indent=2' shrinks the final file size by roughly 30% by eliminating millions of spaces
        json.dump(base_structure, f, ensure_ascii=False)

    print("Process finished successfully.")


if __name__ == "__main__":
    merge_national_osm_jsons()