import json
from collections import defaultdict

# Load the JSON data
with open('new_haftarah_with_individual_verses.json', 'r') as f:
    haftarah_data = json.load(f)

# Function to count verses for each rite and book
def count_verses(data):
    verse_counts_by_rite = defaultdict(lambda: defaultdict(lambda: {"unique": [], "2x": [], "3x": []}))
    overlap_data = defaultdict(list)

    # Process each parsha and rite
    for parsha, rites in data.items():
        for rite, details in rites.items():
            verses = details.get("individual_verses", [])
            for verse in verses:
                overlap_data[verse].append(rite)

    # Count unique, 2x, and 3x verses for each rite and book
    for verse, rites_list in overlap_data.items():
        count = len(rites_list)
        book = verse.split()[0]  # Extract the book name from the verse, e.g., "Isaiah"
        
        for rite in rites_list:
            if count == 1:
                verse_counts_by_rite[rite][book]["unique"].append(verse)
            elif count == 2:
                verse_counts_by_rite[rite][book]["2x"].append(verse)
            elif count >= 3:
                verse_counts_by_rite[rite][book]["3x"].append(verse)
    
    return verse_counts_by_rite

# Function to log the counts for a specific rite and book
def log_counts(verse_counts, rite, book):
    counts = verse_counts[rite][book]
    print(f"\nRite: {rite}, Book: {book}")
    print(f"  Unique (1x): {len(counts['unique'])}, Verses: {', '.join(counts['unique'])}")
    print(f"  Twice (2x): {len(counts['2x'])}, Verses: {', '.join(counts['2x'])}")
    print(f"  Three or more (3x+): {len(counts['3x'])}, Verses: {', '.join(counts['3x'])}")

# Count the verses
verse_counts_by_rite = count_verses(haftarah_data)

# Log the counts for Ashkenazi rite and Isaiah book
log_counts(verse_counts_by_rite, 'Ashkenazi', 'Isaiah')