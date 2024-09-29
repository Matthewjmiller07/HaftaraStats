import json
import pandas as pd

# Load JSON file
json_file_path = "/Applications/Apps/HaftaraStats/haftarah_readings.json"
with open(json_file_path, 'r', encoding='utf-8') as file:
    data = json.load(file)

# Extract all unique rites from the JSON data
all_rites = set()
for readings in data.values():
    all_rites.update(readings.keys())

# Initialize a list for flattened data
flat_data = []

# Iterate through each parsha and rite to populate data
for parsha, readings in data.items():
    row = {'Parsha': parsha}
    for rite in all_rites:
        # Get the readings for the rite, if it exists, otherwise set it as empty
        row[rite] = ", ".join(readings.get(rite, []))
    flat_data.append(row)

# Convert to DataFrame
df = pd.DataFrame(flat_data)

# Order columns to start with 'Parsha'
df = df[['Parsha'] + sorted(all_rites)]

# Save to CSV
csv_file_path = "/Applications/Apps/HaftaraStats/haftarah_readings.csv"
df.to_csv(csv_file_path, index=False)

print(f"CSV file created at: {csv_file_path}")