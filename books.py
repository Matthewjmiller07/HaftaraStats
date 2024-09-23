import json
import re

# Load the updated JSON file
file_path = '/Applications/Apps/haftarah/haftarah_readings_with_lengths.json'

def get_book_name(ref):
    """Extract the book name from the reference."""
    match = re.match(r"(\d?\s?[A-Za-z]+)", ref)
    if match:
        return match.group(1).strip()
    return None

def extract_unique_books(json_data):
    """Extract all unique book names from the JSON data."""
    unique_books = set()

    for parsha, rites in json_data.items():
        for rite, data in rites.items():
            references = data.get('references', [])
            for ref in references:
                book_name = get_book_name(ref)
                if book_name:
                    unique_books.add(book_name)

    return unique_books

def main():
    # Load JSON data from file
    with open(file_path, 'r') as f:
        data = json.load(f)

    # Extract unique books
    unique_books = extract_unique_books(data)

    # Print the unique books
    print("Unique Books Found:")
    for book in sorted(unique_books):
        print(book)

if __name__ == "__main__":
    main()