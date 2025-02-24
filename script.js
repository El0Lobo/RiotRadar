// Toggle Panel Functionality
function togglePanel(panelId) {
  const panel = document.getElementById(panelId);
  panel.classList.toggle("collapsed");
}

// Variables
const cityInput = document.getElementById("cityInput");
const citySuggestions = document.getElementById("citySuggestions");
const radiusInput = document.getElementById("radiusInput");
const radiusValue = document.getElementById("radiusValue");
const resultList = document.getElementById("resultList");
const checkboxes = document.querySelectorAll('.content input[type="checkbox"]');
const modal = document.getElementById("eventModal");
const closeModalButton = document.querySelector(".modal-close");

let map, marker, radiusCircle;
const eventMarkers = [];

// Mock Events Data
const mockEvents = [
  // Past Events
  {
    name: "Concert in Hamburg",
    type: "Concert",
    lat: 53.5511,
    lng: 9.9937,
    description: "A legendary concert in Hamburg.",
    date: "15.09.2023",
  },
  {
    name: "Art Workshop in Stuttgart",
    type: "Workshop",
    lat: 48.7758,
    lng: 9.1829,
    description: "A creative gathering for artists.",
    date: "20.07.2023",
  },
  {
    name: "Underground Party in Cologne",
    type: "Party",
    lat: 50.9375,
    lng: 6.9603,
    description: "A wild night at a secret location.",
    date: "11.05.2023",
  },
  {
    name: "Philosophy Talk in Bremen",
    type: "Talk",
    lat: 53.0793,
    lng: 8.8017,
    description: "Discussing modern philosophy trends.",
    date: "05.12.2022",
  },
  {
    name: "Historical Exhibition in Dresden",
    type: "Exhibition",
    lat: 51.0504,
    lng: 13.7373,
    description: "A collection of historical artifacts.",
    date: "08.03.2023",
  },

  // Future Events
  {
    name: "Concert in Berlin",
    type: "Concert",
    lat: 52.52,
    lng: 13.405,
    description: "An amazing concert in Berlin.",
    date: "30.12.2024",
  },
  {
    name: "Art Workshop in Hamburg",
    type: "Workshop",
    lat: 53.5511,
    lng: 9.9937,
    description: "Creative workshop for art enthusiasts.",
    date: "02.02.2025",
  },
  {
    name: "Party in Munich",
    type: "Party",
    lat: 48.1351,
    lng: 11.582,
    description: "A vibrant party in Munich.",
    date: "29.01.2025",
  },
  {
    name: "Talk in Frankfurt",
    type: "Talk",
    lat: 50.1109,
    lng: 8.6821,
    description: "Insightful talk in Frankfurt.",
    date: "01.02.2025",
  },
  {
    name: "Exhibition in Leipzig",
    type: "Exhibition",
    lat: 51.3397,
    lng: 12.3731,
    description: "An engaging exhibition in Leipzig.",
    date: "31.01.2025",
  },
  {
    name: "Concert in Düsseldorf",
    type: "Concert",
    lat: 51.2277,
    lng: 6.7735,
    description: "Rock bands lighting up the stage.",
    date: "10.03.2025",
  },
  {
    name: "Workshop in Nuremberg",
    type: "Workshop",
    lat: 49.4521,
    lng: 11.0767,
    description: "A hands-on workshop for creators.",
    date: "15.03.2025",
  },
  {
    name: "Party in Hanover",
    type: "Party",
    lat: 52.3759,
    lng: 9.732,
    description: "A lively party with DJs and drinks.",
    date: "22.03.2025",
  },
  {
    name: "Talk in Mannheim",
    type: "Talk",
    lat: 49.4875,
    lng: 8.466,
    description: "A panel on the future of AI.",
    date: "05.04.2025",
  },
  {
    name: "Exhibition in Freiburg",
    type: "Exhibition",
    lat: 47.999,
    lng: 7.8421,
    description: "A modern art exhibition.",
    date: "20.04.2025",
  },
  {
    name: "Concert in Karlsruhe",
    type: "Concert",
    lat: 49.0069,
    lng: 8.4037,
    description: "An open-air concert in the park.",
    date: "10.05.2025",
  },
  {
    name: "Workshop in Münster",
    type: "Workshop",
    lat: 51.9607,
    lng: 7.6261,
    description: "Learn digital painting techniques.",
    date: "25.05.2025",
  },
  {
    name: "Party in Wiesbaden",
    type: "Party",
    lat: 50.0782,
    lng: 8.2398,
    description: "A summer rooftop party.",
    date: "05.06.2025",
  },
  {
    name: "Talk in Augsburg",
    type: "Talk",
    lat: 48.3705,
    lng: 10.8978,
    description: "A lecture on climate change.",
    date: "15.06.2025",
  },
  {
    name: "Exhibition in Essen",
    type: "Exhibition",
    lat: 51.4556,
    lng: 7.0116,
    description: "Photography from around the world.",
    date: "30.06.2025",
  },
];



// Color mapping for event types
const eventTypeColors = {
  Concert: "#ff7f7f",
  Workshop: "#7fcaff",
  Talk: "#ffe47f",
  Party: "#c47fff",
  Exhibition: "#7fffaa",
};

// Initialize Map
function initMap(lat = 51.1657, lng = 10.4515, zoom = 5) {
  map = L.map("map").setView([lat, lng], zoom);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map);

  map.on("click", (e) => {
    // Remove existing marker and circle
    if (marker) map.removeLayer(marker);
    if (radiusCircle) map.removeLayer(radiusCircle);

    // Add a new marker to the map
    marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);

    // Update the radius circle
    updateRadiusCircle(e.latlng.lat, e.latlng.lng);

    filterEvents(); // Live updates to the map
    validateSearchButton(); // Update button state
  });
}

// Handle City Search Input
cityInput.addEventListener("input", async () => {
  const query = cityInput.value.trim();
  if (query.length > 2) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?city=${query}&format=json&limit=5&bounded=1&viewbox=-31.266,81.008,55.828,35.173&accept-language=de`
    );
    const data = await response.json();
    citySuggestions.innerHTML = data
      .map(
        (city) =>
          `<li data-lat="${city.lat}" data-lng="${city.lon}">${city.display_name}</li>`
      )
      .join("");
  } else {
    citySuggestions.innerHTML = "";
  }
});

citySuggestions.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const lat = parseFloat(e.target.getAttribute("data-lat"));
    const lng = parseFloat(e.target.getAttribute("data-lng"));
    cityInput.value = e.target.textContent;
    citySuggestions.innerHTML = "";

    // Set the map view with a custom zoom level
    const zoomLevel = 9; // Adjust the zoom level here
    map.setView([lat, lng], zoomLevel);

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    updateRadiusCircle(lat, lng);
    filterEvents();
  }
});

document.addEventListener("click", (e) => {
  if (!citySuggestions.contains(e.target) && e.target !== cityInput) {
    citySuggestions.innerHTML = "";
  }
});

// Update Radius Circle on Map
function updateRadiusCircle(lat, lng) {
  const radius = radiusInput.value * 1000; // Convert km to meters
  if (radiusCircle) map.removeLayer(radiusCircle);
  radiusCircle = L.circle([lat, lng], { radius }).addTo(map);
}

// Listen for Radius Slider Updates
radiusInput.addEventListener("input", () => {
  radiusValue.textContent = `${radiusInput.value} km`; // Update the display

  if (marker) {
    const { lat, lng } = marker.getLatLng();
    updateRadiusCircle(lat, lng); // Update the circle dynamically
  }

  filterEvents(); // Re-filter events
});

// Update Event Markers on Map
function updateMapMarkers(events) {
  const pastEventsCheckbox = document.querySelector(".checkbox.past input");

  // Clear existing markers
  clearEventMarkers();

  // Add markers for filtered events
  events.forEach((event) => {
    const today = new Date();
    const [day, month, year] = event.date.split(".");
    const eventDate = new Date(year, month - 1, day);

    const isPast = eventDate < today;
    const isPastVisible = pastEventsCheckbox.checked;

    // Only add marker if the event is not in the past, or if it's in the past and the checkbox is checked
    if (!isPast || (isPast && isPastVisible)) {
      const color = eventTypeColors[event.type] || "#808080"; // Default to gray if type not found
      const eventIcon = createSVGIcon(color);

      // Create and add marker to the map
      const eventMarker = L.marker([event.lat, event.lng], {
        icon: eventIcon,
      }).addTo(map);
      eventMarker.bindPopup(`<b>${event.name}</b><br>${event.type}`);
      eventMarkers.push(eventMarker); // Keep track of the marker
    }
  });
}

// Filter Events
function filterEvents() {
  const selectedEventTypes = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  const pastEventsCheckbox = document.querySelector(".checkbox.past input");

  if (selectedEventTypes.length === 0 && !pastEventsCheckbox.checked) {
    updateResultsList([]);
    clearEventMarkers(); // Clear map markers
    return;
  }

  const { lat, lng } = marker ? marker.getLatLng() : { lat: null, lng: null };
  const radius = radiusCircle ? radiusInput.value * 1000 : null;

  const startDate = window.selectedStartDate || null;
  const endDate = window.selectedEndDate || null;

  const today = new Date();

  const filteredEvents = mockEvents.filter((event) => {
    const [day, month, year] = event.date.split(".");
    const eventDate = new Date(year, month - 1, day);

    const isPast = eventDate < today;
    const isPastVisible = isPast && pastEventsCheckbox.checked;
    const isInCategory = selectedEventTypes.includes(event.type);
    const distance =
      lat && radius ? map.distance([lat, lng], [event.lat, event.lng]) : null;
    const isInRadius = !lat || !radius || distance <= radius;
    const isInDateRange =
      (!startDate || eventDate >= startDate) &&
      (!endDate || eventDate <= endDate);

    // Show past events only if the checkbox is checked
    return (isInCategory || isPastVisible) && isInRadius && isInDateRange;
  });

  updateResultsList(filteredEvents);
  updateMapMarkers(filteredEvents);
}

// Create Custom SVG Icon
function createSVGIcon(color) {
  return L.divIcon({
    className: "custom-icon",
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 555.25 800" width="30" height="42" fill="${color}">
      <path d="M277.61,0C124.54,0,0,124.55,0,277.64,0,425,251.88,769.26,262.61,783.84l10,13.62a6.21,6.21,0,0,0,10,0l10-13.62C303.37,769.26,555.25,425,555.25,277.64,555.25,124.55,430.7,0,277.61,0Zm0,178.19a99.45,99.45,0,1,1-99.45,99.45A99.55,99.55,0,0,1,277.61,178.19Z"/>
    </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -36],
  });
}

// Clear All Event Markers
function clearEventMarkers() {
  eventMarkers.forEach((marker) => map.removeLayer(marker));
  eventMarkers.length = 0;
}

// Update Results List
function updateResultsList(events) {
  const pastEventsCheckbox = document.querySelector(".checkbox.past input");

  resultList.innerHTML = events.length
    ? events
        .map((event, index) => {
          const color = eventTypeColors[event.type] || "#808080";
          const today = new Date();
          const [day, month, year] = event.date.split(".");
          const eventDate = new Date(year, month - 1, day);

          const isPast = eventDate < today;
          const pastText =
            isPast && pastEventsCheckbox.checked
              ? `<span class="past-indicator">In the past</span>`
              : "";
          const pastClass =
            isPast && pastEventsCheckbox.checked ? "past-event" : "";

          // Do not include the event if it's in the past and the checkbox is unchecked
          if (isPast && !pastEventsCheckbox.checked) {
            return "";
          }

          return `
            <li data-index="${index}" class="result-item ${pastClass}">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 555.25 800" width="30" height="42" fill="${color}">
                <path d="M277.61,0C124.54,0,0,124.55,0,277.64,0,425,251.88,769.26,262.61,783.84l10,13.62a6.21,6.21,0,0,0,10,0l10-13.62C303.37,769.26,555.25,425,555.25,277.64,555.25,124.55,430.7,0,277.61,0Zm0,178.19a99.45,99.45,0,1,1-99.45,99.45A99.55,99.55,0,0,1,277.61,178.19Z"/>
              </svg>
              <div class="result-details">
                <strong>${event.name}</strong><br>
                <span>${event.type} - ${event.date}</span>
                ${pastText}
              </div>
            </li>`;
        })
        .join("")
    : "<li>No events found.</li>";

  resultList.querySelectorAll(".result-item").forEach((item) => {
    item.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      showEventDetails(index, events);
    });
  });
}

// Show Event Details in Modal
function showEventDetails(index, events) {
  const event = events[index];
  modal.querySelector(".modal-header").textContent = event.name;
  modal.querySelector(".modal-body").innerHTML = `
    <p><strong>Type:</strong> ${event.type}</p>
    <p><strong>Date:</strong> ${event.date}</p>
    <p>${event.description}</p>`;
  modal.classList.add("open");
}

closeModalButton.addEventListener("click", () =>
  modal.classList.remove("open")
);
document.addEventListener("click", (e) => {
  if (!modal.contains(e.target) && !e.target.closest(".result-item")) {
    modal.classList.remove("open");
  }
});

function validateSearchButton() {
  const searchButton = document.getElementById("searchButton");

  // Check if at least one category is selected
  const isCategorySelected = Array.from(checkboxes).some(
    (checkbox) => checkbox.checked
  );

  // Check if a city is selected or a pin is set
  const isLocationSelected =
    cityInput.value.trim() !== "" ||
    (marker && marker.getLatLng() !== undefined);

  console.log("Category Selected:", isCategorySelected);
  console.log("Location Selected:", isLocationSelected);
  console.log("Marker:", marker ? marker.getLatLng() : "No marker set");

  // Enable or disable the button based on conditions
  if (isCategorySelected && isLocationSelected) {
    searchButton.disabled = false;
    searchButton.classList.remove("disabled");
  } else {
    searchButton.disabled = true;
    searchButton.classList.add("disabled");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const infoDiv = document.getElementById("info");
  const logo = document.querySelector(".logo");

  // Initially show the info div
  infoDiv.style.display = "block";

  // Add a click event listener to the logo to toggle the info div
  logo.addEventListener("click", () => {
    if (infoDiv.style.display === "block") {
      infoDiv.style.display = "none";
    } else {
      infoDiv.style.display = "block";
    }
  });

  // Initialize the map
  initMap();

  flatpickr("#dateRangePicker", {
    mode: "range",
    dateFormat: "d.m.Y",
    onChange: function (selectedDates) {
      if (selectedDates.length === 2) {
        [window.selectedStartDate, window.selectedEndDate] = selectedDates;
      } else {
        window.selectedStartDate = null;
        window.selectedEndDate = null;
      }
      filterEvents();
      validateSearchButton();
    },
  });

  radiusValue.textContent = `${radiusInput.value} km`;

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      filterEvents();
      validateSearchButton();
      infoDiv.style.display = "none"; // Hide infoDiv when categories are changed
    });
  });

  const pastEventsCheckbox = document.querySelector(".checkbox.past input");
  if (pastEventsCheckbox) {
    pastEventsCheckbox.addEventListener("change", () => {
      filterEvents();
      validateSearchButton();
      infoDiv.style.display = "none"; // Hide infoDiv when past events checkbox is changed
    });
  }

  cityInput.addEventListener("input", () => {
    validateSearchButton();
    infoDiv.style.display = "none"; // Hide infoDiv when a city is typed
  });

  citySuggestions.addEventListener("click", () => {
    validateSearchButton();
    infoDiv.style.display = "none"; // Hide infoDiv when a city is selected
  });

  if (map) {
    map.on("click", () => {
      validateSearchButton();
      infoDiv.style.display = "none"; // Hide infoDiv when a pin is set
    });
  }

  filterEvents();
  validateSearchButton();
});

// Update Event Markers on Map
function updateMapMarkers(events) {
  const pastEventsCheckbox = document.querySelector(".checkbox.past input");

  // Clear existing markers
  clearEventMarkers();

  // Add markers for filtered events
  events.forEach((event) => {
    const today = new Date();
    const [day, month, year] = event.date.split(".");
    const eventDate = new Date(year, month - 1, day);

    const isPast = eventDate < today;
    const isPastVisible = pastEventsCheckbox.checked;

    if (!isPast || (isPast && isPastVisible)) {
      const color = eventTypeColors[event.type] || "#808080";
      const eventIcon = createSVGIcon(color);

      const eventMarker = L.marker([event.lat, event.lng], {
        icon: eventIcon,
      }).addTo(map);
      eventMarker.bindPopup(`<b>${event.name}</b><br>${event.type}`);
      eventMarkers.push(eventMarker);
    }
  });
}

// Filter Events
function filterEvents() {
  const selectedEventTypes = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  const pastEventsCheckbox = document.querySelector(".checkbox.past input");

  if (selectedEventTypes.length === 0 && !pastEventsCheckbox.checked) {
    updateResultsList([]);
    clearEventMarkers();
    return;
  }

  const { lat, lng } = marker ? marker.getLatLng() : { lat: null, lng: null };
  const radius = radiusCircle ? radiusInput.value * 1000 : null;

  const startDate = window.selectedStartDate || null;
  const endDate = window.selectedEndDate || null;

  const today = new Date();

  const filteredEvents = mockEvents.filter((event) => {
    const [day, month, year] = event.date.split(".");
    const eventDate = new Date(year, month - 1, day);

    const isPast = eventDate < today;
    const isInCategory = selectedEventTypes.includes(event.type);
    const isPastVisible = isPast && pastEventsCheckbox.checked && isInCategory;
    const distance =
      lat && radius ? map.distance([lat, lng], [event.lat, event.lng]) : null;
    const isInRadius = !lat || !radius || distance <= radius;
    const isInDateRange =
      (!startDate || eventDate >= startDate) &&
      (!endDate || eventDate <= endDate);

    return (isInCategory || isPastVisible) && isInRadius && isInDateRange;
  });

  updateResultsList(filteredEvents);
  updateMapMarkers(filteredEvents);
}
