// Define rites and global variables for storing data
const rites = ["Ashkenazi", "Sephardi", "Yemenite", "Italian", "Karaite", "Romaniote"];
let bookOrder = [
  "Joshua", "Judges", "I Samuel", "II Samuel", "I Kings", "II Kings", 
  "Isaiah", "Jeremiah", "Ezekiel", "Hosea", "Joel", "Amos", 
  "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", 
  "Zephaniah", "Haggai", "Zechariah", "Malachi"
];

// Total number of verses in each book of the Bible
const totalVersesPerBook = {
  "Joshua": 658,
  "Judges": 618,
  "I Samuel": 811,
  "II Samuel": 695,
  "I Kings": 817,
  "II Kings": 719,
  "Isaiah": 1291,
  "Jeremiah": 1364,
  "Ezekiel": 1273,
  "Hosea": 197,
  "Joel": 73,
  "Amos": 146,
  "Obadiah": 21,
  "Jonah": 48,
  "Micah": 105,
  "Nahum": 47,
  "Habakkuk": 56,
  "Zephaniah": 53,
  "Haggai": 38,
  "Zechariah": 211,
  "Malachi": 55
};

// Assign consistent colors to each rite
const riteColors = {
  "Ashkenazi": "rgba(255, 99, 132, 0.6)", // Red
  "Sephardi": "rgba(54, 162, 235, 0.6)",  // Blue
  "Yemenite": "rgba(75, 192, 192, 0.6)",  // Green
  "Italian": "rgba(153, 102, 255, 0.6)",  // Purple
  "Karaite": "rgba(255, 206, 86, 0.6)",    // Yellow
  "Romaniote": "rgba(0, 128, 128, 0.6)"   // Teal
};

let haftarahData = {};
let bookVerseCountsByRite = {};  // Store total verses for each book
let riteLengths = {};
let overlapData = {};
let activeRites = new Set(rites);  // Track active rites
let chartOrder = "default"; // Track chart order preference
let showOverlap = false;  // Track whether to show overlapping verses or not

let bookChartInstance = null;  // To hold the Chart.js instance for the book chart
let lengthChartInstance = null;  // To hold the Chart.js instance for the length chart
let parshaSelect;
let weeklyReadingsContainer;


document.addEventListener('DOMContentLoaded', () => {
  // Initialize these variables after the DOM is fully loaded
  parshaSelect = document.getElementById('parsha-select');
  weeklyReadingsContainer = document.getElementById('weekly-readings');

  // Ensure elements are correctly found in the DOM
  if (!parshaSelect || !weeklyReadingsContainer) {
    console.error("Error: Elements with IDs 'parsha-select' or 'weekly-readings' are not found in the DOM.");
    return; // Stop further execution if elements are missing
  }

  // Event listener for dropdown changes (add only if 'parshaSelect' is defined)
  parshaSelect.addEventListener('change', async () => {
    const selectedParsha = parshaSelect.value;

    if (selectedParsha) {
      // Filter charts based on the selected parsha
      filterChartsByParsha(selectedParsha);

      // Generate the weekly readings section
      await generateWeeklyReadings(selectedParsha);
    } else {
      // Clear charts and weekly readings if no selection
      resetChartsAndReadings();
    }
  });

  // Ensure data is loaded and generate all required sections on page load
  loadHaftarahReadings().then(() => {
    generateOrderedVerseList();
    generateWeeklyReadings();
    populateDropdown();
  });
});

// Load the updated JSON file with lengths and individual verses
async function loadHaftarahReadings() {
    const response = await fetch('new_haftarah_with_individual_verses.json');
    const data = await response.json();
    haftarahData = data;
    processData();  // After loading data, process it
}

// Function to process the Haftarah readings data
// Function to process the Haftarah readings data
// Function to process the Haftarah readings data
// Function to process the Haftarah readings data
// Function to process the Haftarah readings data
function processData() {
  riteLengths = {};
  overlapData = {};
  uniqueVersesByRiteAndBook = {}; // Dictionary to track unique verses per rite and book

  rites.forEach(rite => {
    bookVerseCountsByRite[rite] = {};
    riteLengths[rite] = [];
    uniqueVersesByRiteAndBook[rite] = {}; 
  });

  Object.keys(haftarahData).forEach(parsha => {
    rites.forEach(rite => {
      const readingData = haftarahData[parsha][rite];

      if (readingData) {
        const verses = readingData.individual_verses;

        verses.forEach(verse => {
          const book = getBookName(verse);

          // Initialize counts if needed
          bookVerseCountsByRite[rite][book] ??= {
            unique: 0,
            overlap: {},
            uniqueVerses: [],
            overlapVerses: {},
          };

          // Track overlap across rites (for the chart)
          const verseKey = `${verse}-${rite}`;
          overlapData[verseKey] ??= { rites: [], parshas: [] };
          overlapData[verseKey].rites.push(rite);
          overlapData[verseKey].parshas.push(parsha);

          const overlapCount = overlapData[verseKey].rites.length;

          // Initialize overlap counts if needed
          bookVerseCountsByRite[rite][book].overlap[overlapCount] ??= 0;
          bookVerseCountsByRite[rite][book].overlapVerses[overlapCount] ??= [];

          if (overlapCount > 1) {
            bookVerseCountsByRite[rite][book].overlap[overlapCount]++;
            bookVerseCountsByRite[rite][book].overlapVerses[overlapCount].push({ verse, parsha });
          } else {
            bookVerseCountsByRite[rite][book].unique++;
            bookVerseCountsByRite[rite][book].uniqueVerses.push({ verse, parsha });
          }

          // Track unique verses read by this rite (for the percentage table)
          uniqueVersesByRiteAndBook[rite][book] ??= new Set();
          uniqueVersesByRiteAndBook[rite][book].add(verse);
        });

        riteLengths[rite].push(verses.length);
      }
    });
  });

  // Call the logging function after processing the data
  logVerseCountsForRiteAndBook("Karaite", "Joshua");

  toggleChartOrder();
  createLengthChart();
  populatePercentageTable();
}

// Function to log counts of unique and overlapping verses for a given rite and book
function logVerseCountsForRiteAndBook(rite, book) {
  console.log(`\nRite: ${rite}, Book: ${book}`);
  const counts = bookVerseCountsByRite[rite][book] || {
      unique: 0,
      overlap: {},
      uniqueVerses: [],
      overlapVerses: {},
  };

  // Log unique verses
  console.log(`  Unique (1x): ${counts.unique}, Verses:`);
  counts.uniqueVerses.forEach(({ verse, parsha }) => {
      console.log(`    Verse: ${verse}, Parshas: ${overlapData[`${verse}-${rite}`]?.parshas.join(', ')}`);
  });

  // Log verses appearing twice
  console.log(`  Twice (2x): ${counts.overlap[2] || 0}, Verses:`);
  (counts.overlapVerses[2] || []).forEach(({ verse, parsha }) => {
      console.log(`    Verse: ${verse}, Parshas: ${overlapData[`${verse}-${rite}`]?.parshas.join(', ')}`);
  });

  // Log verses appearing three times
  console.log(`  Three or more (3x+): ${counts.overlap[3] || 0}, Verses:`);
  (counts.overlapVerses[3] || []).forEach(({ verse, parsha }) => {
      console.log(`    Verse: ${verse}, Parshas: ${overlapData[`${verse}-${rite}`]?.parshas.join(', ')}`);
  });

  // Log verses appearing seven times
  console.log(`  Seven times (7x): ${counts.overlap[7] || 0}, Verses:`);
  (counts.overlapVerses[7] || []).forEach(({ verse, parsha }) => {
      console.log(`    Verse: ${verse}, Parshas: ${overlapData[`${verse}-${rite}`]?.parshas.join(', ')}`);
  });
}


// Extract the book name from a reference (e.g., "Amos 9:11")
function getBookName(ref) {
  const match = ref.match(/([IV]*\s?[a-zA-Z]+)\s\d+:/);
  return match ? match[1].trim() : ref;
}

// Toggle the chart order and recreate the charts
function toggleChartOrder() {
  if (chartOrder === "mostUsed") {
    const totalVersesByBook = {};
    bookOrder.forEach(book => {
      totalVersesByBook[book] = Array.from(activeRites).reduce((acc, rite) => acc + ((bookVerseCountsByRite[rite][book] || {}).unique || 0), 0);
    });

    bookOrder = Object.keys(totalVersesByBook).sort((a, b) => totalVersesByBook[b] - totalVersesByBook[a]);
  } else {
    bookOrder = [
      "Joshua", "Judges", "I Samuel", "II Samuel", "I Kings", "II Kings", 
      "Isaiah", "Jeremiah", "Ezekiel", "Hosea", "Joel", "Amos", 
      "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", 
      "Zephaniah", "Haggai", "Zechariah", "Malachi"
    ];
  }

  createBookChart();
  createLengthChart();
  populatePercentageTable();
}

// Create the chart for verses per book per rite with correct stacking
// Create the chart for verses per book per rite with correct stacking
function createBookChart() {
  const ctx = document.getElementById('bookChart').getContext('2d');

  if (bookChartInstance) {
    bookChartInstance.destroy();
  }

  const datasets = [];

  Array.from(activeRites).forEach(rite => {
    // Prepare the dataset for unique counts (no multiplication)
    const uniqueCounts = bookOrder.map(book => {
      const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } };
      return counts.unique; // Unique verses
    });

    // Prepare the dataset for 2x counts (multiplied by 2)
    const doubleCounts = bookOrder.map(book => {
      const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } };
      return counts.overlap[2] * 2; // 2x verses multiplied by 2
    });

    // Prepare the dataset for 3x counts (multiplied by 3)
    const tripleCounts = bookOrder.map(book => {
      const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } };
      return counts.overlap[3] * 3; // 3x verses multiplied by 3
    });

    // Add dataset for unique counts
    datasets.push({
      label: `${rite} Unique`,
      data: uniqueCounts,
      backgroundColor: riteColors[rite], // Use the defined color
      stack: rite
    });

    // Add dataset for 2x counts (multiplied for height)
    datasets.push({
      label: `${rite} 2x`,
      data: doubleCounts,
      backgroundColor: riteColors[rite] ? riteColors[rite].replace('0.6', '0.4') : 'rgba(0, 0, 0, 0.2)', // Fallback for undefined colors
      stack: rite
    });

    // Add dataset for 3x counts (multiplied for height)
    datasets.push({
      label: `${rite} 3x`,
      data: tripleCounts,
      backgroundColor: riteColors[rite] ? riteColors[rite].replace('0.6', '0.2') : 'rgba(0, 0, 0, 0.2)', // Use fallback color
      stack: rite
    });
  });

  // Render the chart
  bookChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bookOrder,
      datasets: datasets
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          stacked: true // Always stacked within each rite
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              // Display the actual count (not the multiplied value) in tooltips
              const datasetLabel = tooltipItem.dataset.label;
              const value = tooltipItem.raw;
              if (datasetLabel.includes('2x')) {
                return `${datasetLabel}: ${value / 2} verses (multiplied by 2)`;
              } else if (datasetLabel.includes('3x')) {
                return `${datasetLabel}: ${value / 3} verses (multiplied by 3)`;
              } else {
                return `${datasetLabel}: ${value} verses`;
              }
            }
          }
        }
      }
    }
  });
}

// Create the total length chart with correct stacking
function createLengthChart() {
  const ctx = document.getElementById('lengthChart').getContext('2d');

  if (lengthChartInstance) {
    lengthChartInstance.destroy();
  }

  const datasets = [];

  Array.from(activeRites).forEach(rite => {
    // Calculate total length directly from the JSON data
    const totalLength = Object.keys(haftarahData)
      .reduce((sum, parsha) => 
        sum + (haftarahData[parsha][rite]?.total_length || 0), 0);

    datasets.push({
      label: rite,
      data: [totalLength],
      backgroundColor: riteColors[rite],
      stack: rite
    });
  });

  lengthChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Length'],
      datasets: datasets
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          stacked: true
        }
      }
    }
  });
}

// Populate the percentage table based on the number of verses per book per rite
// New function to calculate the total number of verses read per rite and book
function calculateTotalVersesRead(rite, book) {
  const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: {}, uniqueVerses: [], overlapVerses: {} };

  let allVerses = []; // Array to store all verses (unique and overlapping)

  // Add unique verses
  allVerses.push(...counts.uniqueVerses.map(({ verse }) => verse));

  // Flatten the overlapVerses arrays and add to allVerses
  for (const overlapCount in counts.overlapVerses) {
    allVerses.push(...counts.overlapVerses[overlapCount].map(({ verse }) => verse));
  }

  // Use a Set to get the count of unique verses
  const uniqueVerses = new Set(allVerses);

  return uniqueVerses.size;
}

function populatePercentageTable() {
  const tbody = document.querySelector("#percentageTable tbody");
  tbody.innerHTML = "";

  bookOrder.forEach((book) => {
      const row = tbody.insertRow();
      row.insertCell().textContent = book;

      Array.from(activeRites).forEach((rite) => {
          const counts = bookVerseCountsByRite[rite][book] || {
              unique: 0,
              overlap: {},
              uniqueVerses: [],
              overlapVerses: {},
          };
          const totalVerses = totalVersesPerBook[book];

          let versesRead = 0;

          // Always count unique verses
          versesRead = counts.unique;

          // Add the counts of overlapping verses 
          for (const overlapCount in counts.overlap) {
              versesRead += counts.overlap[overlapCount];
          }

          const percentage = Math.min(((versesRead / totalVerses) * 100), 100).toFixed(2);

          // You can keep or remove these logging statements as needed for debugging
          console.log(`--- Calculating percentage for ${rite} in ${book} ---`);
          console.log("counts:", counts);
          console.log("totalVerses:", totalVerses);
          console.log("versesRead:", versesRead);
          console.log("percentage:", percentage);

          const cell = row.insertCell();
          cell.textContent = `${percentage}%`;
          cell.style.backgroundColor = riteColors[rite];
      });
  });
}


// Event listeners for rite selection, chart order, and overlap toggle
document.querySelectorAll("#rite-selection input[type=checkbox]").forEach(checkbox => {
  checkbox.addEventListener('change', (event) => {
    const rite = event.target.value;
    if (event.target.checked) {
      activeRites.add(rite);
    } else {
      activeRites.delete(rite);
    }
    toggleChartOrder();
    createLengthChart();
    populatePercentageTable();
    generateOrderedVerseList();
  });
});

document.querySelectorAll("#order-toggle input[type=radio]").forEach(radio => {
  radio.addEventListener('change', (event) => {
    chartOrder = event.target.value;
    toggleChartOrder();
  });
});


// Generate the ordered list of verses per book per rite
function generateOrderedVerseList() {
  const verseListDiv = document.getElementById('ordered-verse-list');
  verseListDiv.innerHTML = ''; // Clear previous content

  Array.from(activeRites).forEach(rite => {
    const riteSection = document.createElement('div');
    const riteHeading = document.createElement('h3');
    riteHeading.textContent = `${rite} Rite`;
    riteSection.appendChild(riteHeading);

    const sortedBooks = bookOrder
      .map(book => ({
        book: book,
        verses: bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } }
      }))
      .sort((a, b) => (b.verses.unique + b.verses.overlap[2] * 2 + b.verses.overlap[3] * 3) - (a.verses.unique + a.verses.overlap[2] * 2 + a.verses.overlap[3] * 3));

    const ol = document.createElement('ol');
    sortedBooks.forEach(({ book, verses }) => {
      const li = document.createElement('li');
      li.textContent = `${book}: ${verses.unique} unique, ${verses.overlap[2]} 2x, ${verses.overlap[3]} 3x`;
      ol.appendChild(li);
    });

    riteSection.appendChild(ol);
    verseListDiv.appendChild(riteSection);
  });
}



// Listen for dropdown changes and display selected parsha
// Add Event Listener for Dropdown Changes (added only once)
parshaSelect.addEventListener('change', async () => {
  const selectedParsha = parshaSelect.value;

  if (selectedParsha) {
    // Filter charts based on the selected parsha
    filterChartsByParsha(selectedParsha);
    
    // Generate the weekly readings section
    await generateWeeklyReadings(selectedParsha);
  } else {
    // Clear charts and weekly readings if no selection
    resetChartsAndReadings();
  }
});

// Function to filter charts based on the selected parsha
function filterChartsByParsha(parsha) {
  // Recreate the data structures only for the selected parsha
  riteLengths = {};
  bookVerseCountsByRite = {};
  uniqueVersesByRiteAndBook = {}; // Dictionary to track unique verses per rite and book

  rites.forEach(rite => {
    bookVerseCountsByRite[rite] = {};
    riteLengths[rite] = [];
    uniqueVersesByRiteAndBook[rite] = {}; 
  });

  // Only process data for the selected parsha
  rites.forEach(rite => {
    const readingData = haftarahData[parsha][rite];

    if (readingData) {
      const verses = readingData.individual_verses;

      verses.forEach(verse => {
        const book = getBookName(verse);

        // Initialize counts if needed
        bookVerseCountsByRite[rite][book] ??= {
          unique: 0,
          overlap: {},
          uniqueVerses: [],
          overlapVerses: {},
        };

        const verseKey = `${verse}-${rite}`;
        const overlapCount = overlapData[verseKey]?.rites.length || 1;

        // Initialize overlap counts if needed
        bookVerseCountsByRite[rite][book].overlap[overlapCount] ??= 0;
        bookVerseCountsByRite[rite][book].overlapVerses[overlapCount] ??= [];

        if (overlapCount > 1) {
          bookVerseCountsByRite[rite][book].overlap[overlapCount]++;
          bookVerseCountsByRite[rite][book].overlapVerses[overlapCount].push({ verse, parsha });
        } else {
          bookVerseCountsByRite[rite][book].unique++;
          bookVerseCountsByRite[rite][book].uniqueVerses.push({ verse, parsha });
        }

        // Track unique verses read by this rite
        uniqueVersesByRiteAndBook[rite][book] ??= new Set();
        uniqueVersesByRiteAndBook[rite][book].add(verse);
      });

      riteLengths[rite].push(verses.length);
    }
  });

  // Recreate charts and tables based on the filtered data
  toggleChartOrder();
  createLengthChart();
  populatePercentageTable();
}

// Reset charts and weekly readings when no parsha is selected
function resetChartsAndReadings() {
  weeklyReadingsContainer.innerHTML = ''; // Clear weekly readings

  // Reset data processing for all parshas
  processData();
  toggleChartOrder();
  createLengthChart();
  populatePercentageTable();
}

// Populate the dropdown with available parshiot
function populateDropdown() {
  for (const parsha of Object.keys(haftarahData)) {
    const option = document.createElement('option');
    option.value = parsha;
    option.textContent = parsha;
    parshaSelect.appendChild(option);
  }
}


// Display Haftarah readings for a specific parsha
async function generateWeeklyReadings(selectedParsha) {
  weeklyReadingsContainer.innerHTML = ''; // Clear any old content

  const parshaContainer = document.createElement('div');
  parshaContainer.classList.add('parsha-container');

  // Add parsha title
  const parshaTitle = document.createElement('h2');
  parshaTitle.textContent = `Parsha: ${selectedParsha}`;
  parshaContainer.appendChild(parshaTitle);

  // Create a map to store verse references and associated rites
  const verseRiteMap = {};

  // Loop through each rite for this parsha
  for (const rite of Object.keys(haftarahData[selectedParsha])) {
    const readingData = haftarahData[selectedParsha][rite];

    if (readingData) {
      console.log(`Reading data for ${selectedParsha} - ${rite}:`, readingData);

      // Use the first reference range to fetch the entire Haftarah
      let reference = readingData.references[0];

      console.log(`Reference for ${selectedParsha}, ${rite}:`, reference);

      // Handle multi-word book names
      reference = reference
        .replace('I Kings', 'I_Kings')
        .replace('II Kings', 'II_Kings')
        .replace('I Samuel', 'I_Samuel')
        .replace('II Samuel', 'II_Samuel');

      const formattedReference = reference.replace(/ /g, ".").replace(":", ".");
      console.log(`Formatted reference:`, formattedReference);

      const splitReference = formattedReference.split(".");
      if (splitReference.length < 3) {
        console.error(`Unexpected format for reference: ${formattedReference}`);
        continue;
      }

      const startChapter = parseInt(splitReference[1], 10);
      const startVerse = parseInt(splitReference[2].split("–")[0], 10);

      // Fetch the Hebrew text for the range from Sefaria
      const hebrewVerses = await fetchHebrewTextRange(formattedReference);
      console.log(`Hebrew verses fetched for ${formattedReference}:`, hebrewVerses);

      let currentChapter = startChapter;
      let verseIndex = startVerse;

      // Create a container for each rite
      const riteContainer = document.createElement('div');
      riteContainer.classList.add('rite-container');

      // Add rite title and main reference
      const riteTitle = document.createElement('h3');
      riteTitle.textContent = `${rite} Rite - ${reference.replace('_', ' ')}`;
      riteContainer.appendChild(riteTitle);

      // Map each verse to its associated rite and add to the container
      hebrewVerses.forEach((chapterVerses, chapterOffset) => {
        if (Array.isArray(chapterVerses)) {
          currentChapter = startChapter + chapterOffset;
          if (chapterOffset > 0) {
            verseIndex = 1; // Reset verse index for new chapters
          }

          chapterVerses.forEach((text, index) => {
            const verseKey = `${currentChapter}:${verseIndex + index}`;
            addVerseToMap(verseKey, text, rite, verseRiteMap);
          });
        } else {
          const verseKey = `${currentChapter}:${verseIndex}`;
          addVerseToMap(verseKey, chapterVerses, rite, verseRiteMap);
          verseIndex += 1;
        }
      });

      // Append the rite container to the parsha container
      parshaContainer.appendChild(riteContainer);
    }
  }

  // Display verses and apply highlights based on the rites sharing them
  for (const [verseKey, { rites, text }] of Object.entries(verseRiteMap)) {
    const verseSpan = document.createElement('span');
    verseSpan.classList.add('verse-span');
    verseSpan.innerHTML = `<strong>${verseKey}</strong>: ${text}`;

    // Apply a highlight if the verse is shared among multiple rites
    if (rites.length > 1) {
      verseSpan.classList.add('shared-verse');
    } else {
      const uniqueRite = rites[0].toLowerCase();
      verseSpan.classList.add(`${uniqueRite}-unique-verse`);
    }

    // Append the verse span to each respective rite container
    rites.forEach(rite => {
      const riteContainers = parshaContainer.getElementsByClassName('rite-container');
      for (const container of riteContainers) {
        if (container.querySelector('h3').textContent.includes(rite)) {
          container.appendChild(verseSpan.cloneNode(true));
        }
      }
    });
  }

  weeklyReadingsContainer.appendChild(parshaContainer);
}

// Function to add verses to the map
function addVerseToMap(verseKey, verseText, rite, verseRiteMap) {
  if (!verseRiteMap[verseKey]) {
    verseRiteMap[verseKey] = { rites: [], text: verseText };
  }
  verseRiteMap[verseKey].rites.push(rite);
}

// Function to fetch Hebrew text range from Sefaria
async function fetchHebrewTextRange(reference) {
  try {
    const response = await fetch(`https://www.sefaria.org/api/texts/${reference}?lang=he&context=0`);
    const data = await response.json();
    return Array.isArray(data.he) ? data.he : ["[Text not available]"];
  } catch (error) {
    console.error(`Error fetching Hebrew text for reference: ${reference}`, error);
    return ["Error fetching text"];
  }
}

