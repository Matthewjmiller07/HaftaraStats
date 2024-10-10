// Define rites and global variables for storing data
const rites = ["Chabad","Ashkenazi", "Sephardi", "Yemenite", "Italian", "Karaite", "Romaniote"];
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
  "Karaite": "rgba(255, 206, 86, 0.6)",   // Yellow
  "Romaniote": "rgba(0, 128, 128, 0.6)",  // Teal
  "Chabad": "rgba(255, 159, 64, 0.6)"     // Orange
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
let longestToShortestChartInstance = null; // Global variable for the new chart



async function setDefaultParsha() {
  try {
    // Fetch today's parsha data
    const response = await fetch('https://www.sefaria.org/api/calendars');
    const data = await response.json();

    // Log to see the whole API response
    console.log('[DefaultParsha] API Response:', data);

    // Find the Parashat Hashavua item
    const parshaItem = data.calendar_items.find(item => item.title.en === "Parashat Hashavua");

    if (parshaItem) {
      let parshaName = parshaItem.displayValue.en;

      // Log fetched parsha name
      console.log('[DefaultParsha] Fetched Parsha Name:', parshaName);

      // Check for double parsha and adjust accordingly
      if (parshaName.includes('-')) {
        if (parshaName === "Acharei Mot-Kedoshim") {
          parshaName = parshaName.split('-')[0].trim();
        } else {
          parshaName = parshaName.split('-')[1].trim();
        }
      }

      // Log the adjusted parsha name
      console.log('[DefaultParsha] Adjusted Parsha Name:', parshaName);

      let found = false;
      for (const option of parshaSelect.options) {
        // Normalize apostrophes for comparison
        const normalizedOptionText = option.text.replace(/’/g, "'");
        const normalizedParshaName = parshaName.replace(/’/g, "'");

        // Log comparison of normalized dropdown options
        console.log('[DefaultParsha] Comparing dropdown option:', normalizedOptionText, 'with parsha:', normalizedParshaName);
        
        if (normalizedOptionText === normalizedParshaName) {
          option.selected = true;
          found = true;

          // Log match found
          console.log('[DefaultParsha] Matched Parsha in dropdown:', normalizedParshaName);

          // Filter charts and generate readings based on the default parsha
          filterChartsByParsha(normalizedParshaName);
          await generateWeeklyReadings(normalizedParshaName);

          // Create the length chart for the default parsha
          createLengthChart(normalizedParshaName);

          break;
        }
      }

      if (!found) {
        console.warn('[DefaultParsha] Parsha not found in dropdown:', parshaName);
        resetChartsAndReadings();
      }
    } else {
      console.error('[DefaultParsha] No Parashat Hashavua item found in the calendar data.');
      resetChartsAndReadings();
    }
  } catch (error) {
    console.error('[DefaultParsha] Error fetching current parsha:', error);
    resetChartsAndReadings();
  }
}

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
function createBookChart(selectedParsha = null) {
  const ctx = document.getElementById('bookChart').getContext('2d');

  if (bookChartInstance) {
    bookChartInstance.destroy();
  }

  const datasets = [];

  Array.from(activeRites).forEach(rite => {
    let combinedCounts;

    // Combine all counts when a specific parsha is selected
    if (selectedParsha) {
      combinedCounts = bookOrder.map(book => {
        const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } };
        return counts.unique + (counts.overlap[2] || 0) + (counts.overlap[3] || 0); // Combine all counts into one
      });

      // Add a single dataset for each rite (not stacked)
      datasets.push({
        label: rite,
        data: combinedCounts,
        backgroundColor: riteColors[rite],
        stack: false // Explicitly disable stacking
      });
    } else {
      // When no parsha is selected, use the breakdown (unique, 2x, 3x)
      const uniqueCounts = bookOrder.map(book => {
        const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } };
        return counts.unique; // Unique verses
      });

      const doubleCounts = bookOrder.map(book => {
        const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } };
        return counts.overlap[2] * 2; // 2x verses multiplied by 2
      });

      const tripleCounts = bookOrder.map(book => {
        const counts = bookVerseCountsByRite[rite][book] || { unique: 0, overlap: { 2: 0, 3: 0 } };
        return counts.overlap[3] * 3; // 3x verses multiplied by 3
      });

      // Add datasets for unique, 2x, and 3x counts (stacked by rite)
      datasets.push({
        label: `${rite} Unique`,
        data: uniqueCounts,
        backgroundColor: riteColors[rite],
        stack: rite
      });

      datasets.push({
        label: `${rite} 2x`,
        data: doubleCounts,
        backgroundColor: riteColors[rite] ? riteColors[rite].replace('0.6', '0.4') : 'rgba(0, 0, 0, 0.2)',
        stack: rite
      });

      datasets.push({
        label: `${rite} 3x`,
        data: tripleCounts,
        backgroundColor: riteColors[rite] ? riteColors[rite].replace('0.6', '0.2') : 'rgba(0, 0, 0, 0.2)',
        stack: rite
      });
    }
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
          // Ensure stacking is disabled when a parsha is selected
          stacked: !selectedParsha
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
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
// Create the total length chart with correct stacking
function createLengthChart(selectedParsha = null) {
  const ctx = document.getElementById('lengthChart').getContext('2d');

  if (lengthChartInstance) {
    lengthChartInstance.destroy();
  }

  const datasets = [];

  Array.from(activeRites).forEach(rite => {
    let totalLength = 0;

    // Calculate total length for the selected parsha or all parshiot if none is selected
    if (selectedParsha) {
      totalLength = haftarahData[selectedParsha][rite]?.total_length || 0;
    } else {
      // Sum all total lengths across all parshiot
      totalLength = Object.keys(haftarahData).reduce((sum, parsha) => {
        return sum + (haftarahData[parsha][rite]?.total_length || 0);
      }, 0);
    }

    // Add logging to debug total length calculations
    console.log(`Total length for ${rite}${selectedParsha ? ` in ${selectedParsha}` : ''}: ${totalLength}`);

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
  const table = document.querySelector("#percentageTable");
  const thead = table.querySelector("thead");
  const tbody = table.querySelector("tbody");

  tbody.innerHTML = "";
  thead.innerHTML = "";

  // Create the header row based on active rites
  const headerRow = thead.insertRow();
  headerRow.insertCell().textContent = 'Book';

  // Add a header cell for each active rite
  Array.from(rites).forEach((rite) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = rite;
    headerRow.appendChild(headerCell);
  });

  // Create rows for each book
  bookOrder.forEach((book) => {
    const row = tbody.insertRow();
    row.insertCell().textContent = book;

    // Add cells for each rite (active or not) to maintain consistent spacing
    rites.forEach((rite) => {
      const cell = row.insertCell();
      // Only populate the cell if the rite is active
      if (activeRites.has(rite)) {
        const counts = bookVerseCountsByRite[rite][book] || {
          unique: 0,
          overlap: {},
          uniqueVerses: [],
          overlapVerses: {},
        };
        const totalVerses = totalVersesPerBook[book];

        let versesRead = counts.unique;

        // Add the counts of overlapping verses
        for (const overlapCount in counts.overlap) {
          versesRead += counts.overlap[overlapCount];
        }

        const percentage = Math.min(((versesRead / totalVerses) * 100), 100).toFixed(2);

        // Log for debugging
        console.log(`--- Calculating percentage for ${rite} in ${book} ---`);
        console.log("counts:", counts);
        console.log("totalVerses:", totalVerses);
        console.log("versesRead:", versesRead);
        console.log("percentage:", percentage);

        // Set cell content and background color
        cell.textContent = `${percentage}%`;
        
        // Check for 0.00% and apply grey style
        if (percentage === "0.00") {
          cell.style.backgroundColor = "lightgrey"; // Grey out cells with 0.00%
          cell.style.color = "darkgrey"; // Make the text color dark grey for contrast
        } else {
          cell.style.backgroundColor = riteColors[rite];
        }
      } else {
        // Empty cell for non-active rites
        cell.textContent = "";
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Initialize these variables after the DOM is fully loaded
  parshaSelect = document.getElementById('parsha-select');
  weeklyReadingsContainer = document.getElementById('weekly-readings');
  const bookChartContainer = document.getElementById('bookChartContainer'); // For hiding/showing the verse count chart

  // Ensure elements are correctly found in the DOM
  if (!parshaSelect || !weeklyReadingsContainer || !bookChartContainer) {
    console.error("Error: Elements with IDs 'parsha-select', 'weekly-readings', or 'bookChartContainer' are not found in the DOM.");
    return; // Stop further execution if elements are missing
  }

  // Load data and set up page on load
  loadHaftarahReadings().then(async () => {
    populateDropdown();
    await setDefaultParsha();

    // Generate weekly readings and initial charts for default parsha
    const initialParsha = parshaSelect.value;
    if (initialParsha) {
      bookChartContainer.style.display = 'none'; // Hide the verse count chart if a parsha is set
      await generateWeeklyReadings(initialParsha);
      createLengthChart(initialParsha);
    } else {
      bookChartContainer.style.display = 'block'; // Show the verse count chart if no parsha is set
      createLengthChart(); // Create the unfiltered chart
      createBookChart(); // Create the unfiltered book chart
    }

    // Create the longest to shortest Haftarah chart for all rites
    createLongestToShortestChart(); // Call the new chart creation function here
  });

  // Event listener for dropdown changes
  parshaSelect.addEventListener('change', async () => {
    const selectedParsha = parshaSelect.value;

    if (selectedParsha) {
      // Hide the unfiltered verse count chart when a specific parsha is selected
      bookChartContainer.style.display = 'none';

      // Filter charts and readings based on the selected parsha
      filterChartsByParsha(selectedParsha);
      await generateWeeklyReadings(selectedParsha);
      createLengthChart(selectedParsha); // Create the filtered length chart
    } else {
      // Show the verse count chart when no parsha is selected
      bookChartContainer.style.display = 'block';

      resetChartsAndReadings();
    }
  });

  // Combined event listener for rite selection changes
  document.querySelectorAll("#rite-selection input[type=checkbox]").forEach(checkbox => {
    checkbox.addEventListener('change', async (event) => {
      const rite = event.target.value;

      if (event.target.checked) {
        activeRites.add(rite);
      } else {
        activeRites.delete(rite);
      }

      // Regenerate weekly readings and charts based on the current parsha and active rites
      const selectedParsha = parshaSelect.value;
      if (selectedParsha) {
        await generateWeeklyReadings(selectedParsha);
        createLengthChart(selectedParsha); // Update filtered length chart
      } else {
        // If no specific parsha is selected, update the unfiltered chart
        createLengthChart();
      }

      // Always update the chart order and any other charts that rely on rite selection
      createBookChart(); // Recreate the book chart with the updated rites
      populatePercentageTable();

      // Update longest to shortest Haftarah chart based on active rites
      createLongestToShortestChart(); // Call this to update the new chart as well
    });
  });

  // Event listeners for order toggle
  document.querySelectorAll("#order-toggle input[type=radio]").forEach(radio => {
    radio.addEventListener('change', (event) => {
      chartOrder = event.target.value;

      // If no specific parsha is selected, toggle the chart order for the broad view
      if (!parshaSelect.value) {
        toggleChartOrder();
      }

      // Recreate the longest to shortest Haftarah chart based on order selection
      createLongestToShortestChart(); // Call this to ensure the order affects the new chart
    });
  });
});

// Remove the duplicate event listener for `parshaSelect`

// Function to filter charts based on the selected parsha
function filterChartsByParsha(parsha) {
  // Recreate the data structures only for the selected parsha
  riteLengths = {};
  bookVerseCountsByRite = {};
  uniqueVersesByRiteAndBook = {}; // Dictionary to track unique verses per rite and book

  rites.forEach(rite => {
    bookVerseCountsByRite[rite] = {};
    riteLengths[rite] = 0;  // Initialize as zero to store the total length
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

      // Update the total length for the rite for the selected parsha
      riteLengths[rite] += readingData.total_length || 0;
    }
  });

  // Recreate charts and tables based on the filtered data
  toggleChartOrder();
  createLengthChart(parsha);  // Ensure the chart is recreated with filtered data
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
  // Clear existing options
  parshaSelect.innerHTML = '';

  // Add a default option
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select a Parsha';
  parshaSelect.appendChild(defaultOption);

  // Add all parshiot from haftarahData in the original order
  for (const parsha of Object.keys(haftarahData)) { // Use natural order from the JSON
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
    // **Only proceed if the rite is active**
    if (!activeRites.has(rite)) continue;

    const readingData = haftarahData[selectedParsha][rite];

    if (readingData) {
      console.log(`Reading data for ${selectedParsha} - ${rite}:`, readingData);

      // Use the first reference range to fetch the entire Haftarah
      let reference = readingData.references[0];

      // Handle multi-word book names
      reference = reference
        .replace('I Kings', 'I_Kings')
        .replace('II Kings', 'II_Kings')
        .replace('I Samuel', 'I_Samuel')
        .replace('II Samuel', 'II_Samuel');

      const formattedReference = reference.replace(/ /g, ".").replace(":", ".");

      // Fetch the Hebrew text for the range from Sefaria
      const hebrewVerses = await fetchHebrewTextRange(formattedReference);
      let currentChapter = parseInt(formattedReference.split(".")[1], 10);
      let verseIndex = parseInt(formattedReference.split(".")[2].split("–")[0], 10);

      // Collect all verses in an array for sorting
      const versesWithIndices = [];

      hebrewVerses.forEach((chapterVerses, chapterOffset) => {
        if (Array.isArray(chapterVerses)) {
          currentChapter += chapterOffset;
          if (chapterOffset > 0) verseIndex = 1; // Reset verse index for new chapters
          chapterVerses.forEach((text, index) => {
            versesWithIndices.push({ chapter: currentChapter, verse: verseIndex + index, text, rite });
          });
        } else {
          versesWithIndices.push({ chapter: currentChapter, verse: verseIndex, text: chapterVerses, rite });
          verseIndex++;
        }
      });

      // Create and append rite container
      const riteContainer = document.createElement('div');
      riteContainer.classList.add('rite-container');
      const riteTitle = document.createElement('h3');
      riteTitle.textContent = `${rite} Rite - ${reference.replace('_', ' ')}`;
      riteContainer.appendChild(riteTitle);
      parshaContainer.appendChild(riteContainer);

      // Map verses to the current rite
      versesWithIndices.forEach(({ chapter, verse, text }) => {
        const verseKey = `${chapter}:${verse}`;
        addVerseToMap(verseKey, text, rite, verseRiteMap);
      });
    }
  }

  // Filter and display verses based on the active rites
  for (const verseKey of Object.keys(verseRiteMap).sort((a, b) => {
    const [aChapter, aVerse] = a.split(':').map(Number);
    const [bChapter, bVerse] = b.split(':').map(Number);
    return aChapter === bChapter ? aVerse - bVerse : aChapter - bChapter;
  })) {
    const { rites, text } = verseRiteMap[verseKey];
    if (!rites.some(rite => activeRites.has(rite))) continue; // Skip if none of the rites are active

    const verseSpan = document.createElement('span');
    verseSpan.classList.add('verse-span');
    verseSpan.innerHTML = `<strong>${verseKey}</strong>: ${text}`;

    // Highlight if shared among multiple rites
    if (rites.length > 1) {
      verseSpan.classList.add('shared-verse');
    } else {
      const uniqueRite = rites[0].toLowerCase();
      verseSpan.classList.add(`${uniqueRite}-unique-verse`);
    }

    // Append the verse span to the respective rite containers
    rites.forEach(rite => {
      if (activeRites.has(rite)) {
        const riteContainers = parshaContainer.getElementsByClassName('rite-container');
        for (const container of riteContainers) {
          if (container.querySelector('h3').textContent.includes(rite)) {
            container.appendChild(verseSpan.cloneNode(true));
          }
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

// Function to create the longest to shortest Haftarah chart
function createLongestToShortestChart() {
  const ctx = document.getElementById('longestToShortestChart').getContext('2d');

  // Destroy any existing chart instance to avoid overlay issues
  if (longestToShortestChartInstance) {
    longestToShortestChartInstance.destroy();
  }

  // Filter rites based on active selection
  const activeRiteList = Array.from(activeRites);

  // Sort the haftarah readings for each rite by length
  const sortedRitesData = {};
  Object.keys(haftarahData).forEach(parsha => {
    activeRiteList.forEach(rite => {
      const readingData = haftarahData[parsha][rite];
      if (readingData) {
        const totalLength = readingData.total_length || 0;
        if (!sortedRitesData[rite]) sortedRitesData[rite] = [];
        sortedRitesData[rite].push({ parsha, totalLength });
      }
    });
  });

  // Sort the data for each rite based on the selected chart order
  Object.keys(sortedRitesData).forEach(rite => {
    if (chartOrder === "mostUsed") {
      // Order by the total length of readings across all parshiot
      sortedRitesData[rite].sort((a, b) => b.totalLength - a.totalLength);
    } else {
      // Default to the order as provided in the JSON file (natural order of parshiot)
      sortedRitesData[rite].sort((a, b) => Object.keys(haftarahData).indexOf(a.parsha) - Object.keys(haftarahData).indexOf(b.parsha));
    }
  });

  // Prepare datasets for the chart
  const datasets = activeRiteList.map(rite => {
    const parshaLabels = sortedRitesData[rite].map(item => item.parsha);
    const totalLengths = sortedRitesData[rite].map(item => item.totalLength);

    return {
      label: rite,
      data: totalLengths,
      backgroundColor: riteColors[rite],
      stack: rite
    };
  });

  // Create the new Chart.js instance
  longestToShortestChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from(new Set(activeRiteList.flatMap(rite => sortedRitesData[rite].map(item => item.parsha)))),
      datasets: datasets
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          stacked: false
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              return `${tooltipItem.dataset.label}: ${tooltipItem.raw} verses`;
            }
          }
        }
      }
    }
  });
}
