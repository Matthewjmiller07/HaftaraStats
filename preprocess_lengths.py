import requests
import json
import time

def get_total_verses(ref):
    ref = ref.replace("–", "-")  # Replace en-dash with hyphen
    if "-" not in ref and ":" in ref:  # Single verse reference
        print(f"{ref} is a single verse, counting as 1.")
        return 1

    url = f"https://www.sefaria.org/api/texts/{ref}?context=0"
    print(f"Fetching: {url}")
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        
        # Handle verse ranges from the API
        if isinstance(data.get('text', []), list):
            if isinstance(data['text'][0], list):  # Verse ranges
                verse_count = sum(len(verses) for verses in data['text'])
            else:  # Single verse or single section
                verse_count = len(data['text'])
            
            print(f"{ref} has {verse_count} verses")
            return verse_count
        else:
            print(f"Error parsing {url}")
            return 0
    else:
        print(f"Error fetching {url}: {response.status_code}")
        return 0

# Sample Haftarah readings
haftarah_readings = {
  "Bereshit": {
    "Ashkenazi": ["Isaiah 42:5–43:10"],
    "Sephardi": ["Isaiah 42:5–21"],
    "Portuguese": ["Isaiah 42:5–21", "Isaiah 61:10", "Isaiah 62:5"],
    "Italian": ["Isaiah 42:1–21"],
    "Yemenite": ["Isaiah 42:1–16"],
    "Romaniote": ["Isaiah 65:16–66:11"],
    "Karaite": ["Isaiah 65:17–66:13"]
  },
  "Noach": {
    "Ashkenazi": ["Isaiah 54:1–55:5"],
    "Sephardi": ["Isaiah 54:1–10"],
    "Italian": ["Isaiah 54:1–55:5"],
    "Yemenite": ["Isaiah 54:1–55:5", "Isaiah 54:1–55:3"],
    "Romaniote": ["Isaiah 54:9–55:12"],
    "Karaite": ["Isaiah 54:9–55:12"]
  },
  "Lech-Lecha": {
    "Ashkenazi": ["Isaiah 40:27–41:16"],
    "Sephardi": ["Isaiah 40:27–41:16"],
    "Italian": ["Isaiah 40:25–41:17"],
    "Yemenite": ["Isaiah 40:25–41:17"],
    "Romaniote": ["Joshua 24:3–23"],
    "Karaite": ["Joshua 24:3–18"]
  },
  "Vayeira": {
    "Ashkenazi": ["2 Kings 4:1–37"],
    "Sephardi": ["2 Kings 4:1–23"],
    "Italian": ["2 Kings 4:1–37"],
    "Yemenite": ["2 Kings 4:1–37"],
    "Romaniote": ["Isaiah 33:17–34:13"],
    "Karaite": ["Isaiah 33:17–35:12", "Isaiah 35:10"]
  },
  "Chayei Sarah": {
    "Ashkenazi": ["1 Kings 1:1–31"],
    "Sephardi": ["1 Kings 1:1–31"],
    "Yemenite": ["1 Kings 1:1–31", "1 Kings 1:46"],
    "Dardaim": ["1 Kings 1:1–31"],
    "Italian": ["1 Kings 1:1–34"],
    "Karaite": ["Isaiah 51:2–22"],
    "Romaniote": ["Isaiah 51:2–22"]
  },
  "Toledot": {
    "Ashkenazi": ["Malachi 1:1–2:7"],
    "Sephardi": ["Malachi 1:1–2:7"],
    "Italian": ["Malachi 1:1–2:7"],
    "Yemenite": ["Malachi 1:1–3:4"],
    "Karaite": ["Isaiah 65:23–66:18"],
    "Romaniote": ["Isaiah 65:23–66:18"]
  },
  "Vayetze": {
    "Ashkenazi": ["Hosea 12:13–14:10"],
    "Sephardi": ["Hosea 11:7–12:12"],
    "Italian": ["Hosea 11:7–12:14"],
    "Yemenite": ["Hosea 11:7–12:14"],
    "Karaite": ["Hosea 11:7–13:5"],
    "Romaniote": ["Hosea 12:13–14:3"]
  },
  "Vayishlach": {
    "Ashkenazi": ["Obadiah 1:1–21"],
    "Sephardi": ["Obadiah 1:1–21"],
    "Italian": ["Obadiah 1:1–21"],
    "Yemenite": ["Obadiah 1:1–21"],
    "Karaite": ["Obadiah 1:1–21"],
    "Romaniote": ["Obadiah 1:1–21"]
  },
  "Vayeshev": {
    "Ashkenazi": ["Amos 2:6–3:8"],
    "Sephardi": ["Amos 2:6–3:8"],
    "Italian": ["Amos 2:6–3:8"],
    "Yemenite": ["Amos 2:6–3:8"],
    "Romaniote": ["Isaiah 32:18–33:18"],
    "Karaite": ["Isaiah 32:18–33:22"]
  },
  "Miketz": {
    "Ashkenazi": ["1 Kings 3:15–4:1"],
    "Sephardi": ["1 Kings 3:15–4:1"],
    "Italian": ["1 Kings 3:15–28"],
    "Romaniote": ["Isaiah 29:7–30:4"],
    "Karaite": ["Isaiah 29:7–24"]
  },
  "Vayigash": {
    "Ashkenazi": ["Ezekiel 37:15–28"],
    "Sephardi": ["Ezekiel 37:15–28"],
    "Italian": ["Ezekiel 37:15–28"],
    "Yemenite": ["Ezekiel 37:15–28"],
    "Romaniote": ["Joshua 14:6–15:6"],
    "Karaite": ["Joshua 14:6–14:15"]
  },
  "Vayechi": {
    "Ashkenazi": ["1 Kings 2:1–12"],
    "Sephardi": ["1 Kings 2:1–12"],
    "Italian": ["1 Kings 2:1–12"],
    "Yemenite": ["1 Kings 2:1–12"],
    "Karaite": ["2 Kings 13:14–14:7"],
    "Romaniote": ["2 Kings 13:14–14:7"]
  },
  "Shemot": {
    "Ashkenazi": ["Isaiah 27:6–28:13", "Isaiah 29:22–23"],
    "Sephardi": ["Jeremiah 1:1–2:3"],
    "Yemenite": ["Ezekiel 16:1–14"],
    "Italian": ["Jeremiah 1:1–2:3"],
    "Karaite": ["Isaiah 27:6–28:13"]
  },
  "Va'eira": {
    "Ashkenazi": ["Ezekiel 28:25–29:21"],
    "Sephardi": ["Ezekiel 28:25–29:21"],
    "Yemenite": ["Ezekiel 28:24–29:21"],
    "Italian": ["Ezekiel 28:24–29:21"],
    "Karaite": ["Isaiah 42:8–43:5"]
  },
  "Bo": {
    "Ashkenazi": ["Jeremiah 46:13–28"],
    "Sephardi": ["Isaiah 19:1–25"],
    "Yemenite": ["Isaiah 18:7–19:25"],
    "Italian": ["Isaiah 18:7–19:25"],
    "Karaite": ["Isaiah 34:11–35:10"],
    "Romaniote": ["Isaiah 34:11–36:4"]
  },
  "Beshalach": {
    "Ashkenazi": ["Judges 4:4–5:31"],
    "Sephardi": ["Judges 5:1–31"],
    "Yemenite": ["Judges 4:23–5:31"],
    "Italian": ["Judges 4:4–5:3"],
    "Karaite": ["Joshua 24:7–24:26"]
  },
  "Yitro": {
    "Ashkenazi": ["Isaiah 6:1–7:6", "Isaiah 9:5–6"],
    "Sephardi": ["Isaiah 6:1–13"],
    "Yemenite": ["Isaiah 6:1–6:13", "Isaiah 9:5–6"],
    "Italian": ["Isaiah 6:1–13"],
    "Karaite": ["Isaiah 33:13–34:8"],
    "Romaniote": ["Isaiah 33:13–34:10"]
  },
  "Mishpatim": {
    "Ashkenazi": ["Jeremiah 34:8–22", "Jeremiah 33:25–26"],
    "Sephardi": ["Jeremiah 34:8–22", "Jeremiah 33:25–26"],
    "Yemenite": ["Jeremiah 34:8–35:19"],
    "Italian": ["Jeremiah 34:8–35:11"],
    "Karaite": ["Isaiah 56:1–57:2"],
    "Romaniote": ["Isaiah 56:1–57:10"]
  },
  "Terumah": {
    "Ashkenazi": ["1 Kings 5:26–6:13"],
    "Sephardi": ["1 Kings 5:26–6:13"],
    "Yemenite": ["1 Kings 5:26–6:13"],
    "Italian": ["1 Kings 5:26–6:13"],
    "Karaite": ["Isaiah 60:17–61:9"],
    "Romaniote": ["Isaiah 60:17–62:3"]
  },
  "Tetzaveh": {
    "Ashkenazi": ["Ezekiel 43:10–27"],
    "Sephardi": ["Ezekiel 43:10–27"],
    "Yemenite": ["Ezekiel 43:10–27"],
    "Italian": ["Ezekiel 43:10–27"],
    "Karaite": ["Jeremiah 11:16–12:15"]
  },
  "Ki Tissa": {
    "Ashkenazi": ["1 Kings 18:1–39"],
    "Sephardi": ["1 Kings 18:20–39"],
    "Yemenite": ["1 Kings 18:1–46"],
    "Italian": ["1 Kings 18:1–38"],
    "Karaite": ["Isaiah 43:7–44:5"],
    "Romaniote": ["Isaiah 43:7–44:2"]
  },
  "Vayakhel": {
    "Ashkenazi": ["1 Kings 7:40–50"],
    "Sephardi": ["1 Kings 7:13–26"],
    "Yemenite": ["1 Kings 7:13–22"],
    "Italian": ["1 Kings 7:13–26"],
    "Karaite": ["1 Kings 8:1–8:19"],
    "Romaniote": ["1 Kings 8:1–8:10"]
  },
  "Pekudei": {
    "Ashkenazi": ["1 Kings 7:51–8:21"],
    "Sephardi": ["1 Kings 7:40–50"],
    "Yemenite": ["1 Kings 7:40–50"],
    "Italian": ["1 Kings 7:40–51"],
    "Karaite": ["Jeremiah 30:18–31:13"],
    "Romaniote": ["1 Kings 7:27–47"]
  },
  "Vayikra": {
    "Ashkenazi": ["Isaiah 43:21–44:23"],
    "Sephardi": ["Isaiah 43:21–44:6"],
    "Yemenite": ["Isaiah 43:21–44:6"],
    "Karaite": ["Isaiah 43:21–44:23"],
    "Romaniote": ["Isaiah 43:21–44:13"]
  },
  "Tzav": {
    "Ashkenazi": ["Jeremiah 7:21–8:3", "Jeremiah 9:22–23"],
    "Sephardi": ["Jeremiah 7:21–8:3", "Jeremiah 9:22–23"],
    "Yemenite": ["Jeremiah 7:21–28", "Jeremiah 9:22–23"],
    "Karaite": ["Malachi 3:4–24", "Malachi 3:23"],
    "Romaniote": ["Malachi 3:4–3:24"]
  },
  "Shemini": {
    "Ashkenazi": ["2 Samuel 6:1–7:17"],
    "Sephardi": ["2 Samuel 6:1–19"],
    "Yemenite": ["2 Samuel 6:1–7:3"],
    "Karaite": ["Ezekiel 43:27–44:16"],
    "Romaniote": ["Ezekiel 43:27–44:21"]
  },
  "Tazria": {
    "Ashkenazi": ["2 Kings 4:42–5:19"],
    "Sephardi": ["2 Kings 4:42–5:19"],
    "Yemenite": ["2 Kings 4:42–5:19"],
    "Karaite": ["Isaiah 66:7–66:24", "Isaiah 66:23"],
    "Romaniote": ["Isaiah 66:7–66:24"]
  },
  "Metzora": {
    "Ashkenazi": ["2 Kings 7:3–20"],
    "Sephardi": ["2 Kings 7:3–20"],
    "Yemenite": ["2 Kings 7:1–20", "2 Kings 13:23"],
    "Karaite": ["2 Kings 7:3–18"]
  },
  "Acharei Mot": {
    "Ashkenazi": ["Amos 9:7–15"],
    "Sephardi": ["Ezekiel 22:1–16"],
    "Yemenite": ["Ezekiel 22:1–16"],
    "Romaniote": ["Ezekiel 22:1–20"]
  },
  "Kedoshim": {
    "Ashkenazi": ["Amos 9:7–15"],
    "Sephardi": ["Ezekiel 20:2–20"],
    "Yemenite": ["Ezekiel 20:1–20"],
    "Italian": ["Ezekiel 34:1–15"],
    "Karaite": ["Isaiah 4:3–5:16"],
    "Romaniote": ["Isaiah 3:4–5:17"]
  },
  "Emor": {
    "Ashkenazi": ["Ezekiel 44:15–31"],
    "Sephardi": ["Ezekiel 44:15–31"],
    "Yemenite": ["Ezekiel 44:15–31"],
    "Karaite": ["Ezekiel 44:25–45:11"],
    "Romaniote": ["Ezekiel 44:15–31"]
  },
  "Behar": {
    "Ashkenazi": ["Jeremiah 32:6–27"],
    "Sephardi": ["Jeremiah 32:6–27"],
    "Yemenite": ["Jeremiah 16:19–17:14"],
    "Karaite": ["Isaiah 24:2–23"]
  },
  "Bechukotai": {
    "Ashkenazi": ["Jeremiah 16:19–17:14"],
    "Sephardi": ["Jeremiah 16:19–17:14"],
    "Yemenite": ["Ezekiel 34:1–27"],
    "Italian": ["Ezekiel 34:1–15"],
    "Karaite": ["Isaiah 1:19–2:11"],
    "Romaniote": ["Isaiah 1:19–2:11"]
  },
  "Bemidbar": {
    "Ashkenazi": ["Hosea 2:1–22"],
    "Sephardi": ["Hosea 2:1–22"],
    "Yemenite": ["Hosea 2:1–22"]
  },
  "Naso": {
    "Ashkenazi": ["Judges 13:2–25"],
    "Sephardi": ["Judges 13:2–25"],
    "Yemenite": ["Judges 13:2–25"],
    "Karaite": ["Judges 13:2–24"],
    "Romaniote": ["Hosea 4:14–6:2"]
  },
  "Behaalotecha": {
    "Ashkenazi": ["Zechariah 2:14–4:7"],
    "Sephardi": ["Zechariah 2:14–4:7"],
    "Yemenite": ["Zechariah 2:14–4:9"],
    "Karaite": ["Zechariah 2:14–4:7"]
  },
  "Sh'lach": {
    "Ashkenazi": ["Joshua 2:1–24"],
    "Sephardi": ["Joshua 2:1–24"],
    "Yemenite": ["Joshua 2:1–24"],
    "Romaniote": ["Joshua 2:1–21"],
    "Karaite": ["Joshua 2:1–15"]
  },
  "Korach": {
    "Ashkenazi": ["1 Samuel 11:14–12:22"],
    "Sephardi": ["1 Samuel 11:14–12:22"],
    "Yemenite": ["1 Samuel 11:14–12:22"],
    "Romaniote": ["Hosea 10:2–11:8"],
    "Karaite": ["Hosea 10:2–11:9"]
  },
  "Chukat": {
    "Ashkenazi": ["Judges 11:1–33"],
    "Sephardi": ["Judges 11:1–33"],
    "Yemenite": ["Judges 11:1–40"],
    "Romaniote": ["Judges 11:1–21"],
    "Karaite": ["Judges 11:1–17"]
  },
  "Balak": {
    "Ashkenazi": ["Micah 5:6–6:8"],
    "Sephardi": ["Micah 5:6–6:8"],
    "Yemenite": ["Micah 5:6–6:8"],
    "Italian": ["Micah 5:4–6:8"],
    "Karaite": ["Micah 5:6–6:8"]
  },
  "Pinchas": {
    "Ashkenazi": ["1 Kings 18:46–19:21"],
    "Sephardi": ["1 Kings 18:46–19:21"],
    "Yemenite": ["1 Kings 18:46–19:21"],
    "Karaite": ["Malachi 2:5–3:3"]
  },
  "Matot": {
    "Ashkenazi": ["Jeremiah 1:1–2:3"],
    "Sephardi": ["Jeremiah 1:1–2:3"],
    "Yemenite": ["Jeremiah 1:1–2:3"],
    "Italian": ["Joshua 13:15–33"],
    "Karaite": ["Jeremiah 1:1–2:3"]
  },
  "Masei": {
    "Ashkenazi": ["Jeremiah 2:4–28", "Jeremiah 3:4"],
    "Sephardi": ["Jeremiah 2:4–28", "Jeremiah 4:1–2"],
    "Yemenite": ["Jeremiah 1:1–19"],
    "Italian": ["Joshua 19:51–21:3"],
    "Karaite": ["Joshua 20:1–9"]
  },
  "Devarim": {
    "Ashkenazi": ["Isaiah 1:1–27"],
    "Sephardi": ["Isaiah 1:1–27"],
    "Yemenite": ["Isaiah 1:21–31"],
    "Italian": ["Isaiah 1:1–27"],
    "Karaite": ["Isaiah 1:1–27"]
  },
  "Va'etchanan": {
    "Ashkenazi": ["Isaiah 40:1–26"],
    "Sephardi": ["Isaiah 40:1–26"],
    "Yemenite": ["Isaiah 40:1–27", "Isaiah 41:17"],
    "Italian": ["Isaiah 40:1–15"],
    "Karaite": ["Isaiah 40:1–22"]
  },
  "Eikev": {
    "Ashkenazi": ["Isaiah 49:14–51:3"],
    "Sephardi": ["Isaiah 49:14–51:3"],
    "Yemenite": ["Isaiah 49:14–51:3"],
    "Romaniote": ["Isaiah 49:1–51:3"],
    "Karaite": ["Isaiah 49:14–50:5"]
  },
  "Re'eh": {
    "Ashkenazi": ["Isaiah 54:11–55:5"],
    "Sephardi": ["Isaiah 54:11–55:5"],
    "Yemenite": ["Isaiah 54:11–55:5"],
    "Karaite": ["Isaiah 54:11–56:1"]
  },
  "Shoftim": {
    "Ashkenazi": ["Isaiah 51:12–52:12"],
    "Sephardi": ["Isaiah 51:12–52:12"],
    "Yemenite": ["Isaiah 51:12–52:12"],
    "Italian": ["1 Samuel 8:1–22"],
    "Karaite": ["Isaiah 51:12–52:8"]
  },
  "Ki Teitzei": {
    "Ashkenazi": ["Isaiah 54:1–10"],
    "Sephardi": ["Isaiah 54:1–10"],
    "Yemenite": ["Isaiah 54:1–10"],
    "Italian": ["1 Samuel 17:1–37"],
    "Karaite": ["Isaiah 54:1–17"]
  },
  "Ki Tavo": {
    "Ashkenazi": ["Isaiah 60:1–22"],
    "Sephardi": ["Isaiah 60:1–22"],
    "Yemenite": ["Isaiah 60:1–22"],
    "Italian": ["Joshua 8:30–9:27"],
    "Karaite": ["Isaiah 60:1–16"]
  },
  "Nitzavim": {
    "Ashkenazi": ["Isaiah 61:10–63:9"],
    "Sephardi": ["Isaiah 61:10–63:9"],
    "Yemenite": ["Isaiah 61:9–63:9"],
    "Italian": ["Joshua 24:1–18"],
    "Karaite": ["Isaiah 61:10–63:1"]
  },
  "Vayelech": {
    "Ashkenazi": ["Isaiah 55:6–56:8"],
    "Sephardi": ["Isaiah 55:6–56:8"],
    "Yemenite": ["Isaiah 55:6–56:8"],
    "Italian": ["Isaiah 55:6–56:8"]
  },
  "Ha'azinu": {
    "Ashkenazi": ["2 Samuel 22:1–51"],
    "Sephardi": ["2 Samuel 22:1–51"],
    "Yemenite": ["Ezekiel 17:22–18:32"],
    "Karaite": ["Hosea 14:2–10"]
  },
  "V'Zot HaBerachah": {
    "Ashkenazi": ["Joshua 1:1–18"],
    "Sephardi": ["Joshua 1:1–9"],
    "Yemenite": ["Joshua 1:1–9", "Joshua 6:27"],
    "Karaite": ["Joshua 1:1–10"],
    "Romaniote": ["1 Kings 9:22–34"]
  }
}

# Process Haftarah readings and calculate lengths
haftarah_with_lengths = {}

for parsha, rites in haftarah_readings.items():
    haftarah_with_lengths[parsha] = {}
    for rite, readings in rites.items():
        haftarah_with_lengths[parsha][rite] = {}
        total_verse_count = 0
        for ref in readings:
            verse_count = get_total_verses(ref)
            total_verse_count += verse_count
            time.sleep(1)  # Be kind to the API by adding a short delay between requests

        haftarah_with_lengths[parsha][rite] = {
            "references": readings,
            "total_length": total_verse_count
        }

# Save the updated Haftarah readings with lengths to a new JSON file
with open('haftarah_readings_with_lengths.json', 'w') as outfile:
    json.dump(haftarah_with_lengths, outfile, indent=2)

print("Haftarah readings with verse counts have been saved to 'haftarah_readings_with_lengths.json'")