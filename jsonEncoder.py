import os
import json

BASE_PATH = "FLAGS"
start_id = 1  # Change si tu veux continuer depuis un ID précis

current_id = start_id

def next_id():
    global current_id
    val = f"{current_id:08d}"
    current_id += 1
    return val

data = {}

for continent in sorted(os.listdir(BASE_PATH)):
    continent_path = os.path.join(BASE_PATH, continent)
    if not os.path.isdir(continent_path):
        continue

    data[continent] = {}

    for country in sorted(os.listdir(continent_path)):
        country_path = os.path.join(continent_path, country)
        if not os.path.isdir(country_path):
            continue

        country_entry = {
            "flag": None,
            "subdivisions": {}
        }

        # Detect country flag
        for file in os.listdir(country_path):
            if file.lower().endswith((".png", ".gif", ".jpg", ".webp")):
                country_entry["flag"] = {
                    "id": next_id(),
                    "name": country,
                    "type": "Country",
                    "image": f"{BASE_PATH}/{continent}/{country}/{file}"
                }
                break

        # Subdivisions
        for subdivision_type in sorted(os.listdir(country_path)):
            subdivision_path = os.path.join(country_path, subdivision_type)

            if not os.path.isdir(subdivision_path):
                continue

            country_entry["subdivisions"][subdivision_type] = []

            for file in sorted(os.listdir(subdivision_path)):
                if file.lower().endswith((".png", ".gif", ".jpg", ".webp", ".svg", ".jpeg")):
                    name = os.path.splitext(file)[0]

                    country_entry["subdivisions"][subdivision_type].append({
                        "id": next_id(),
                        "name": name,
                        "type": subdivision_type,
                        "image": f"{BASE_PATH}/{continent}/{country}/{subdivision_type}/{file}"
                    })

        data[continent][country] = country_entry

with open("dataFlagsGenerated.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ JSON généré dans dataFlagsGenerated.json")