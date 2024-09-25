import json
from collections import defaultdict

# Load the new JSON file with individual verses
def load_haftarah_data(file_path):
    with open(file_path, 'r') as file:
        return json.load(file)

# Function to audit for overlapping verses within a rite
def audit_rite_overlaps(haftarah_data):
    overlap_report = defaultdict(lambda: defaultdict(list))  # Store overlaps for each rite
    
    # Iterate through each parsha and rite
    for parsha, rites in haftarah_data.items():
        for rite, details in rites.items():
            individual_verses = details.get("individual_verses", [])
            # Track which verses have been seen for each rite
            for verse in individual_verses:
                overlap_report[rite][verse].append(parsha)
    
    return overlap_report

# Function to display overlaps
def display_overlaps(overlap_report):
    has_overlap = False
    for rite, verses in overlap_report.items():
        print(f"\nRite: {rite}")
        for verse, parshas in verses.items():
            if len(parshas) > 1:  # Verse appears in multiple parshas
                has_overlap = True
                print(f"  Overlapping verse: {verse}")
                for parsha in parshas:
                    print(f"    Parsha: {parsha}")
    
    if not has_overlap:
        print("\nNo overlapping verses found within any rites.")

# Main function to run the audit
def main():
    # Path to the JSON file
    file_path = '/Applications/Apps/HaftaraStats/new_haftarah_with_individual_verses.json'
    
    # Load data
    haftarah_data = load_haftarah_data(file_path)
    
    # Audit for overlapping verses within each rite
    overlap_report = audit_rite_overlaps(haftarah_data)
    
    # Display the results
    display_overlaps(overlap_report)

if __name__ == "__main__":
    main()