import json
import csv
import re

# Load the chapter-verse data from the CSV file
def load_chapter_verse_data(csv_file_path):
    chapter_verse_data = {}
    with open(csv_file_path, mode='r') as file:
        csv_reader = csv.DictReader(file)
        for row in csv_reader:
            book = row["Books"].strip()
            chapter = int(row["Chapter"].strip())
            verses = int(row["Verses"].strip())
            if book not in chapter_verse_data:
                chapter_verse_data[book] = {}
            chapter_verse_data[book][chapter] = verses
    return chapter_verse_data

# Expand ranges into individual verses, handling cross-chapter ranges
def extract_individual_verses(book, chapter_start, verse_start, chapter_end, verse_end, chapter_verse_data):
    individual_verses = []
    
    # Iterate through chapters, starting from chapter_start to chapter_end
    for chapter in range(chapter_start, chapter_end + 1):
        # Get the max verses in this chapter
        max_verses_in_chapter = chapter_verse_data.get(book, {}).get(chapter, 0)
        
        if chapter == chapter_start:
            start_verse = verse_start
        else:
            start_verse = 1
        
        if chapter == chapter_end:
            end_verse = min(verse_end, max_verses_in_chapter)
        else:
            end_verse = max_verses_in_chapter
        
        # Generate verse list for the current chapter
        for verse in range(start_verse, end_verse + 1):
            individual_verses.append(f"{book} {chapter}:{verse}")
    
    return individual_verses

# Parse the biblical reference into book, chapter, start/end verses
def parse_biblical_reference(reference):
    pattern = r"((I+|II+|III+)?\s?[A-Za-z]+)\s(\d+):(\d+)(?:–(\d+))?"
    match = re.match(pattern, reference)
    
    if match:
        book = match.group(1).strip()
        chapter = int(match.group(3))
        verse_start = int(match.group(4))
        verse_end = int(match.group(5)) if match.group(5) else verse_start
        return book, chapter, verse_start, verse_end
    else:
        print(f"Error parsing reference {reference}")
        return None, None, None, None

# Handle references that span multiple chapters (e.g., "Isaiah 42:5–43:10")
def parse_cross_chapter_reference(reference):
    pattern = r"((I+|II+|III+)?\s?[A-Za-z]+)\s(\d+):(\d+)–(\d+):(\d+)"
    match = re.match(pattern, reference)
    
    if match:
        book = match.group(1).strip()
        start_chapter = int(match.group(3))
        start_verse = int(match.group(4))
        end_chapter = int(match.group(5))
        end_verse = int(match.group(6))
        return book, start_chapter, start_verse, end_chapter, end_verse
    else:
        return parse_biblical_reference(reference)

# Create the new JSON with individual verses
def create_new_json(haftarah_data, chapter_verse_data):
    new_data = {}
    for parsha, rites in haftarah_data.items():
        new_data[parsha] = {}
        for rite, details in rites.items():
            new_data[parsha][rite] = {
                "references": details["references"],
                "total_length": details["total_length"],
                "individual_verses": []
            }
            for ref in details["references"]:
                if "–" in ref and ":" in ref.split("–")[1]:  # Handle cross-chapter ranges
                    book, start_chapter, start_verse, end_chapter, end_verse = parse_cross_chapter_reference(ref)
                else:  # Handle single chapter ranges
                    book, start_chapter, start_verse, end_verse = parse_biblical_reference(ref)
                    end_chapter = start_chapter  # If no cross-chapter, end chapter is the same as start chapter

                if book and start_chapter in chapter_verse_data.get(book, {}):
                    verses = extract_individual_verses(book, start_chapter, start_verse, end_chapter, end_verse, chapter_verse_data)
                    if verses is not None:  # Only add valid verses
                        new_data[parsha][rite]["individual_verses"].extend(verses)
                    else:
                        print(f"Skipping invalid reference: {ref} in {parsha} for {rite}")
    return new_data

# Save the new JSON data to a file
def save_new_json(data, output_file_path):
    with open(output_file_path, 'w') as json_file:
        json.dump(data, json_file, indent=4)

# Main function to load data, process, and save the new JSON
def main():
    # Paths to the files
    json_file_path = '/Applications/Apps/HaftaraStats/haftarah_readings_with_lengths.json'  # Path to the original JSON file
    csv_file_path = '/Users/matthewmiller/Desktop/Tanach Chapters - Sheet1.csv'  # Path to your CSV file
    output_file_path = '/Users/matthewmiller/Desktop/new_haftarah_with_individual_verses.json'  # Output file path to your desktop

    # Load haftarah data and chapter-verse data
    with open(json_file_path, 'r') as json_file:
        haftarah_data = json.load(json_file)
    
    chapter_verse_data = load_chapter_verse_data(csv_file_path)

    # Create new JSON with individual verses
    new_json_data = create_new_json(haftarah_data, chapter_verse_data)

    # Save the new JSON
    save_new_json(new_json_data, output_file_path)
    print(f"New JSON file created: {output_file_path}")

if __name__ == "__main__":
    main()