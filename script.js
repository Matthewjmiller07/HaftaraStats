// Define rites and global variables for storing data
const rites = ["Ashkenazi", "Sephardi", "Yemenite", "Italian", "Karaite"];
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
  "Karaite": "rgba(255, 206, 86, 0.6)"    // Yellow
};

let haftarahData = {};
let bookVerseCountsByRite = {};  // Store total verses for each book
let riteLengths = {};
let activeRites = new Set(rites);  // Track active rites
let chartOrder = "default"; // Track chart order preference

let bookChartInstance = null;  // To hold the Chart.js instance for the book chart
let lengthChartInstance = null;  // To hold the Chart.js instance for the length chart

// Load the updated JSON file with lengths
async function loadHaftarahReadings() {
    const response = await fetch('haftarah_readings_with_lengths.json'); // Use relative path
    const data = await response.json();
    haftarahData = data;
    processData();  // After loading data, process it
}

// Function to process the Haftarah readings data
function processData() {
  bookVerseCountsByRite = {};
  riteLengths = {};

  // Initialize arrays for each rite
  rites.forEach(rite => {
    bookVerseCountsByRite[rite] = {};
    riteLengths[rite] = [];
  });

  // Process each Parsha in the data
  Object.keys(haftarahData).forEach(parsha => {
    rites.forEach(rite => {
      const readingData = haftarahData[parsha][rite];
      if (readingData) {
        const refs = readingData.references;
        const totalLength = readingData.total_length;

        // Sum up the verses for each book
        refs.forEach(ref => {
          const book = getBookName(ref);
          if (!bookVerseCountsByRite[rite][book]) {
            bookVerseCountsByRite[rite][book] = 0;
          }
          bookVerseCountsByRite[rite][book] += totalLength;
        });

        riteLengths[rite].push(totalLength);
      }
    });
  });

  toggleChartOrder();  // Initialize charts with the correct order
  createLengthChart();
  populatePercentageTable(); // Function to populate the percentage table
}

// Helper function to extract the book name from a reference
function getBookName(ref) {
  const match = ref.match(/([IV]*\s?[a-zA-Z]+)\s\d+:/);  // Captures Roman numerals too
  return match ? match[1].trim() : ref;
}

// Function to toggle the chart order
function toggleChartOrder() {
  if (chartOrder === "mostUsed") {
    // Calculate total verses for all books across all active rites
    const totalVersesByBook = {};
    bookOrder.forEach(book => {
      totalVersesByBook[book] = Array.from(activeRites).reduce((acc, rite) => acc + (bookVerseCountsByRite[rite][book] || 0), 0);
    });
    
    // Order books by total number of verses across active rites
    bookOrder = Object.keys(totalVersesByBook).sort((a, b) => totalVersesByBook[b] - totalVersesByBook[a]);
  } else {
    // Reset to default order
    bookOrder = [
      "Joshua", "Judges", "I Samuel", "II Samuel", "I Kings", "II Kings", 
      "Isaiah", "Jeremiah", "Ezekiel", "Hosea", "Joel", "Amos", 
      "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", 
      "Zephaniah", "Haggai", "Zechariah", "Malachi"
    ];
  }

  createBookChart();
  populatePercentageTable();
}

// Create the chart for book counts by rite (total number of verses per book)
function createBookChart() {
  const ctx = document.getElementById('bookChart').getContext('2d');

  if (bookChartInstance) {
    bookChartInstance.destroy();  // Destroy the previous chart before creating a new one
  }

  const datasets = Array.from(activeRites).map(rite => {
    const verseCounts = bookOrder.map(book => bookVerseCountsByRite[rite][book] || 0);
    return {
      label: rite,
      data: verseCounts,
      backgroundColor: riteColors[rite],  // Use consistent colors for each rite
      borderColor: riteColors[rite],
      borderWidth: 1
    };
  });

  bookChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: bookOrder,
      datasets: datasets
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Create the chart for total lengths by rite
function createLengthChart() {
  const ctx = document.getElementById('lengthChart').getContext('2d');

  if (lengthChartInstance) {
    lengthChartInstance.destroy();  // Destroy the previous chart before creating a new one
  }

  const lengths = Array.from(activeRites).map(rite => riteLengths[rite].reduce((a, b) => a + b, 0));

  lengthChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from(activeRites),
      datasets: [{
        label: 'Total Length of Readings',
        data: lengths,
        backgroundColor: Array.from(activeRites).map(rite => riteColors[rite]),  // Consistent colors
        borderColor: Array.from(activeRites).map(rite => riteColors[rite]),
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

// Populate the percentage of each book read for each rite
function populatePercentageTable() {
  const tbody = document.querySelector("#percentageTable tbody");
  tbody.innerHTML = '';  // Clear existing rows

  bookOrder.forEach(book => {
    const row = document.createElement("tr");

    // Add book name
    const bookCell = document.createElement("td");
    bookCell.textContent = book;
    row.appendChild(bookCell);

    // Add percentage read for each active rite
    Array.from(activeRites).forEach(rite => {
      const percentageCell = document.createElement("td");
      const versesRead = bookVerseCountsByRite[rite][book] || 0;
      const totalVerses = totalVersesPerBook[book];
      const percentage = ((versesRead / totalVerses) * 100).toFixed(2);
      percentageCell.textContent = `${Math.min(percentage, 100)}%`;  // Cap at 100%
      percentageCell.style.backgroundColor = riteColors[rite];  // Apply consistent background color
      row.appendChild(percentageCell);
    });

    tbody.appendChild(row);
  });
}

// Event listener for rite checkboxes
document.querySelectorAll("#rite-selection input[type=checkbox]").forEach(checkbox => {
  checkbox.addEventListener('change', (event) => {
    const rite = event.target.value;
    if (event.target.checked) {
      activeRites.add(rite);
    } else {
      activeRites.delete(rite);
    }
    // Recreate the charts and table with the updated rites
    toggleChartOrder();  // Recalculate order based on new active rites
    createLengthChart();
    populatePercentageTable();
    generateOrderedVerseList(); // Generate the ordered list
  });
});

// Event listener for chart order toggle
document.querySelectorAll("#order-toggle input[type=radio]").forEach(radio => {
  radio.addEventListener('change', (event) => {
    chartOrder = event.target.value;
    toggleChartOrder();  // Rebuild the charts with the new order
  });
});

// Function to generate an ordered list of verses per book by rite
function generateOrderedVerseList() {
  const verseListDiv = document.getElementById('ordered-verse-list');
  verseListDiv.innerHTML = ''; // Clear previous content

  // Iterate over each rite and create a list
  Array.from(activeRites).forEach(rite => {
    // Create a section for each rite
    const riteSection = document.createElement('div');
    const riteHeading = document.createElement('h3');
    riteHeading.textContent = `${rite} Rite`;
    riteSection.appendChild(riteHeading);

    // Sort books by the number of verses in descending order
    const sortedBooks = bookOrder
      .map(book => ({
        book: book,
        verses: bookVerseCountsByRite[rite][book] || 0
      }))
      .sort((a, b) => b.verses - a.verses);

    // Create an ordered list
    const ol = document.createElement('ol');
    sortedBooks.forEach(({ book, verses }) => {
      const li = document.createElement('li');
      li.textContent = `${book}: ${verses} verses`;
      ol.appendChild(li);
    });

    riteSection.appendChild(ol);
    verseListDiv.appendChild(riteSection);
  });
}

// Ensure the ordered list is generated on page load
loadHaftarahReadings().then(() => generateOrderedVerseList());

// Load the Haftarah readings on page load
loadHaftarahReadings();
