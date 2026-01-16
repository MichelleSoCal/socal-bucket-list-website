// Shared Airport Flights JavaScript
// Used by individual airport pages (SNA, LGB, LAX, etc.)
// Each page just needs to set: window.AIRPORT_CODE = 'SNA' before including this file

// Airtable configuration
const AIRTABLE_TOKEN = 'pat4HICXlDN0QBxkZ.b8d2092207dd1ee3ec676ab0b131f19ae92d17bcc17b0c9fb25d0a64dd1e0024';
const AIRTABLE_BASE_ID = 'appGoQsy2UiGyyZ3T';

async function fetchAllRecords(tableName) {
    let records = [];
    let offset = null;

    do {
        const url = offset
            ? `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?offset=${offset}`
            : `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${AIRTABLE_TOKEN}` }
        });

        if (!response.ok) throw new Error(`Failed to fetch ${tableName}`);

        const data = await response.json();
        records = records.concat(data.records);
        offset = data.offset;
    } while (offset);

    return records;
}

async function fetchFlightsFromAirtable() {
    try {
        // Fetch all records with pagination
        const [flightsRecords, airportsRecords, airlinesRecords, countriesRecords, citiesRecords, statesRecords] = await Promise.all([
            fetchAllRecords('Flights'),
            fetchAllRecords('Airports'),
            fetchAllRecords('Airlines'),
            fetchAllRecords('Destinations_Country'),
            fetchAllRecords('Destinations_City'),
            fetchAllRecords('Destinations_State')
        ]);

        const flightsData = { records: flightsRecords };
        const airportsData = { records: airportsRecords };
        const airlinesData = { records: airlinesRecords };
        const countriesData = { records: countriesRecords };
        const citiesData = { records: citiesRecords };
        const statesData = { records: statesRecords };

        // Create lookup maps for linked tables
        const countriesMap = {};
        countriesData.records.forEach(country => {
            countriesMap[country.id] = country.fields.Country || country.fields.Name || '';
        });

        const citiesMap = {};
        citiesData.records.forEach(city => {
            citiesMap[city.id] = city.fields.City || city.fields.Name || '';
        });

        const statesMap = {};
        statesData.records.forEach(state => {
            statesMap[state.id] = state.fields.State || state.fields.Name || '';
        });

        // Create lookup maps
        const airportsMap = {};
        airportsData.records.forEach(airport => {
            // Look up values from linked records
            const countryId = airport.fields.Country?.[0];
            const cityId = airport.fields.City?.[0];
            const stateId = airport.fields.State?.[0];

            const countryName = countryId ? countriesMap[countryId] : '';
            const cityName = cityId ? citiesMap[cityId] : '';
            const stateName = stateId ? statesMap[stateId] : '';

            airportsMap[airport.id] = {
                code: airport.fields.Airport_Code,
                city: cityName,
                state: stateName,
                country: countryName
            };
        });

        const airlinesMap = {};
        airlinesData.records.forEach(airline => {
            airlinesMap[airline.id] = airline.fields.Airline_Name;
        });

        // Enrich flight data with actual names
        return flightsData.records.map(flight => {
            const arrivalAirport = flight.fields.Arrival_Airport?.map(id => airportsMap[id])[0] || {};

            // City is linked on the Flight record, State comes from Airport
            const cityId = flight.fields.City?.[0];
            const cityName = cityId ? citiesMap[cityId] : '';

            return {
                ...flight,
                enriched: {
                    arrivalAirport: {
                        ...arrivalAirport,
                        city: cityName || arrivalAirport.city
                    },
                    airlines: flight.fields.Airlines?.map(id => airlinesMap[id]) || []
                }
            };
        });
    } catch (error) {
        console.error('Error fetching flights:', error);
        return [];
    }
}

function groupFlightsByRoute(flights) {
    const grouped = {};

    flights.forEach(flight => {
        const route = flight.fields.Flight_Route;
        if (!route) return;

        const airportInfo = flight.enriched.arrivalAirport;

        if (!grouped[route]) {
            grouped[route] = {
                route: route,
                city: airportInfo?.city || airportInfo?.code || 'Unknown',
                state: airportInfo?.state || '',
                country: airportInfo?.country || '',
                airportCode: airportInfo?.code || 'Unknown',
                airlines: [],
                duration: flight.fields.Duration_Minutes,
                distance: flight.fields.Distance_Miles
            };
        }

        // Add airlines from enriched data
        flight.enriched.airlines.forEach(airline => {
            if (airline && !grouped[route].airlines.includes(airline)) {
                grouped[route].airlines.push(airline);
            }
        });
    });

    return Object.values(grouped);
}

function formatDuration(minutes) {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function displayFlights(flights, containerId) {
    const container = document.getElementById(containerId);

    if (flights.length === 0) {
        container.innerHTML = '<div class="loading">No flights found</div>';
        return;
    }

    container.innerHTML = flights.map(flight => `
        <div class="flight-card">
            <div class="destination-name">${flight.city}${flight.state ? ', ' + flight.state : ''}${flight.country && flight.country !== 'USA' ? ', ' + flight.country : ''}</div>
            <div class="flight-route">${flight.route}</div>
            <div class="airlines">
                ${flight.airlines.map(airline =>
                    `<span class="airline-tag">${airline}</span>`
                ).join('')}
            </div>
            <div class="flight-details">
                ${flight.duration ? `⏱️ ~${formatDuration(flight.duration)}` : ''}
                ${flight.distance ? `📍 ${flight.distance} mi` : ''}
            </div>
        </div>
    `).join('');
}

// Global variables
let allGroupedFlights = [];
let currentAirlineFilter = '';
let currentStateFilter = '';
let currentCountryFilter = '';
let currentSortMode = 'shortest';

// Populate airline filter dropdown
function populateAirlineFilter(flights) {
    const airlines = new Set();
    flights.forEach(flight => {
        flight.airlines.forEach(airline => airlines.add(airline));
    });

    const airlineFilter = document.getElementById('airline-filter');
    const sortedAirlines = Array.from(airlines).sort();

    sortedAirlines.forEach(airline => {
        const option = document.createElement('option');
        option.value = airline;
        option.textContent = airline;
        airlineFilter.appendChild(option);
    });
}

// Populate state filter dropdown
function populateStateFilter(flights) {
    const states = new Set();
    flights.forEach(flight => {
        if (flight.state) states.add(flight.state);
    });

    const stateFilter = document.getElementById('state-filter');
    const sortedStates = Array.from(states).sort();

    sortedStates.forEach(state => {
        const option = document.createElement('option');
        option.value = state;
        option.textContent = state;
        stateFilter.appendChild(option);
    });
}

// Populate country filter dropdown
function populateCountryFilter(flights) {
    const countries = new Set();
    flights.forEach(flight => {
        if (flight.country) countries.add(flight.country);
    });

    const countryFilter = document.getElementById('country-filter');
    if (!countryFilter) return; // Skip if no country filter on page

    const sortedCountries = Array.from(countries).sort();

    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country;
        option.textContent = country;
        countryFilter.appendChild(option);
    });
}

// Filter and sort flights
function filterAndDisplayFlights() {
    let filteredFlights = allGroupedFlights;

    // Apply airline filter
    if (currentAirlineFilter) {
        filteredFlights = filteredFlights.filter(flight =>
            flight.airlines.includes(currentAirlineFilter)
        );
    }

    // Apply state filter
    if (currentStateFilter) {
        filteredFlights = filteredFlights.filter(flight =>
            flight.state === currentStateFilter
        );
    }

    // Apply country filter
    if (currentCountryFilter) {
        filteredFlights = filteredFlights.filter(flight =>
            flight.country === currentCountryFilter
        );
    }

    // Apply sorting
    if (currentSortMode === 'shortest') {
        filteredFlights.sort((a, b) => {
            const durationA = a.duration || 999999;
            const durationB = b.duration || 999999;
            return durationA - durationB;
        });
    } else if (currentSortMode === 'longest') {
        filteredFlights.sort((a, b) => {
            const durationA = a.duration || 0;
            const durationB = b.duration || 0;
            return durationB - durationA;
        });
    }

    displayFlights(filteredFlights, 'flights-grid');
}

// Load flights on page load
window.addEventListener('DOMContentLoaded', async () => {
    const airportCode = window.AIRPORT_CODE || 'SNA';

    const allFlights = await fetchFlightsFromAirtable();

    // Filter flights that include the specified airport (both departures and arrivals)
    const airportFlights = allFlights.filter(flight => {
        const route = flight.fields.Flight_Route || '';
        return route.includes(airportCode);
    });

    // Group flights by route to combine airlines
    allGroupedFlights = groupFlightsByRoute(airportFlights);

    // Populate filters
    populateAirlineFilter(allGroupedFlights);
    populateStateFilter(allGroupedFlights);
    populateCountryFilter(allGroupedFlights);

    // Display initial flights
    filterAndDisplayFlights();

    // Set up filter event listeners
    document.getElementById('airline-filter').addEventListener('change', (e) => {
        currentAirlineFilter = e.target.value;
        filterAndDisplayFlights();
    });

    document.getElementById('state-filter').addEventListener('change', (e) => {
        currentStateFilter = e.target.value;
        filterAndDisplayFlights();
    });

    const countryFilter = document.getElementById('country-filter');
    if (countryFilter) {
        countryFilter.addEventListener('change', (e) => {
            currentCountryFilter = e.target.value;
            filterAndDisplayFlights();
        });
    }

    document.getElementById('sort-filter').addEventListener('change', (e) => {
        currentSortMode = e.target.value;
        filterAndDisplayFlights();
    });

    console.log(`Total ${airportCode} flights:`, allGroupedFlights.length);
});
