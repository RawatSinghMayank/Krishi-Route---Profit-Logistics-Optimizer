# Krishi-Route
### Smart Market Selection for Maximum Profit

> A React-based web application that helps Indian farmers find the most profitable Agricultural Produce Market Committee (APMC/Mandi) to sell their crops by integrating live government price data, real-time fuel-adjusted transport costs, and GPS-based routing algorithms.

---

##  Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How It Works](#how-it-works)
- [Data Sources](#data-sources)
- [Core Algorithms](#core-algorithms)
- [Component Reference](#component-reference)
- [Services Reference](#services-reference)
- [Data Files Reference](#data-files-reference)
- [Fuel Price Integration](#fuel-price-integration)
- [eNAM API Integration](#enam-api-integration)
- [Supported Crops](#supported-crops)
- [Supported Vehicles](#supported-vehicles)
- [Supported Markets](#supported-markets)
- [Setup & Installation](#setup--installation)
- [Current Limitations & MVP Scope](#current-limitations--mvp-scope)
- [Future Roadmap](#future-roadmap)

---

## Overview

Krishi-Route solves a critical problem faced by farmers in India: **which mandi (agricultural market) gives the highest net profit after accounting for transport costs?** The nearest mandi is not always the most profitable one. By fetching live prices from the Government of India's eNAM (Electronic National Agriculture Market) portal and calculating fuel-adjusted transport costs using the Haversine distance formula, Krishi-Route ranks every mandi in Rajasthan by net profit and presents the results in a clear, visual dashboard.

The MVP is currently scoped to **Rajasthan**, covering **130+ APMC markets** across the state.

---

## Key Features

###  Live Government Price Data
- Fetches real-time commodity prices directly from the **eNAM Government API** (`/web/Ajax_ctrl/trade_data_list`)
- Queries a **7-day rolling window** to capture all recent market activity, even for markets that don't report daily
- Supports filtering by state and commodity name

###  Fuel-Adjusted Transport Cost Calculation
- Farmers can input **today's local diesel rate** (₹ per litre)
- Vehicle transport costs are dynamically scaled relative to a ₹90/L baseline, so rising or falling fuel prices are reflected instantly in profit calculations
- Formula: `Adjusted Rate/km = Base Rate/km × (Current Diesel ÷ ₹90)`

###  GPS-Based Location Detection
- Auto-detects the user's location via the **browser Geolocation API**
- Maps GPS coordinates to the correct Indian state using a `stateBoundaries.json` polygon dataset
- If outside Rajasthan, defaults gracefully to Rajasthan for MVP compatibility

###  Haversine Routing Algorithm
- Calculates the **exact straight-line distance** in kilometres between the farmer's location and each mandi using the Haversine great-circle formula
- Uses real GPS coordinates from a curated `mandiCoordinates.json` file covering 130+ Rajasthan APMCs

###  Visual Cost Breakdown
- **Stacked Bar Chart** — compares revenue, transport cost, handling cost, and net profit across all markets simultaneously
- **Pie Chart (Distribution View)** — shows the revenue distribution (profit vs. costs) for any individually selected mandi
- **Cost Efficiency Cards** — displays cost ratio (%) and profit-per-km for the top 3 markets

###  Profit Cards with Smart Badges
- Each mandi is ranked by net profit and shown as a card
- Cards include: market price per quintal, distance, transport cost, handling cost, net profit, profit margin %, and a revenue breakdown
- Smart badges: **Best Choice**, **Good Option**, **Fair Option**, **Lower Profit**
- Price trend alerts (rising/falling) and perishability warnings for short shelf-life crops

###  Route Visualization
- An interactive map (`RouteMap` component) plots the farmer's origin and all found mandis
- Highlights the **best mandi** visually

###  Impact Metrics
- Top-level summary cards shown before the detailed results
- Includes potential savings vs. nearest mandi, total markets compared, and other key figures

###  Animated Loading States
- A cycling loader with 5 contextual messages walks the user through each processing step:
  1. Connecting to eNAM Government Servers
  2. Fetching live market prices
  3. Calculating diesel & transport costs
  4. Running Haversine routing algorithms
  5. Plotting optimal profitability

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React (Hooks: `useState`, `useEffect`) |
| Charts | Recharts (`BarChart`, `PieChart`, `ResponsiveContainer`) |
| Styling | CSS Modules (per-component `.css` files) |
| Data Fetching | Native `fetch` API with `FormData` |
| Geolocation | Browser `navigator.geolocation` API |
| Distance Math | Custom Haversine implementation |
| Data | eNAM Government API + local JSON files |
| Build Tool | Vite (implied by React + JSX structure) |

---

## Project Structure

```
krishi-route/
├── src/
│   ├── App.jsx                          # Root component
│   ├── App.css
│   │
│   ├── Components/
│   │   ├── Dashboard/
│   │   │   ├── Dashboard.jsx            # Main layout, state orchestrator
│   │   │   └── Dashboard.css
│   │   ├── InputForm/
│   │   │   ├── InputForm.jsx            # User input: crop, quantity, vehicle, diesel, location
│   │   │   └── InputForm.css
│   │   ├── ProfitCards/
│   │   │   ├── ProfitCards.jsx          # Per-mandi profit breakdown cards
│   │   │   └── ProfitCards.css
│   │   ├── CostBreakdown/
│   │   │   ├── CostBreakdown.jsx        # Bar + Pie charts for cost analysis
│   │   │   └── CostBreakdown.css
│   │   ├── ImpactMetrics/               # Top-level summary stats (component file not uploaded)
│   │   └── RouteMap/                    # Leaflet/map component (component file not uploaded)
│   │
│   ├── services/
│   │   ├── enamApi.js                   # eNAM government API integration
│   │   └── profitCalculator.js          # Core profitability engine
│   │
│   ├── data/
│   │   ├── mockData.json                # Vehicles & crops master data
│   │   ├── mandiCoordinates.json        # GPS coords for 130+ Rajasthan APMCs
│   │   └── stateBoundaries.json         # State polygon data for GPS detection
│   │
│   └── utils/
│       └── stateDetector.js             # GPS → Indian state mapping utility
```

---

## How It Works

### End-to-End Flow

```
User fills InputForm
        │
        ▼
Dashboard.handleTripSubmit(formData)
        │
        ├──► fetchLivePrices(state, commodity)   [enamApi.js]
        │         └── POST to eNAM API (last 7 days)
        │         └── Returns array of { apmc, modal_price, state, created_at, ... }
        │
        └──► calculateProfitability(formData, liveData)   [profitCalculator.js]
                  ├── Convert quantity to quintals
                  ├── Adjust vehicle rate for current diesel price
                  ├── For each eNAM record:
                  │       ├── Look up APMC GPS coords in mandiCoordinates.json
                  │       ├── Calculate distance via Haversine formula
                  │       ├── Compute transport cost = distance × adjustedRatePerKm
                  │       ├── Add ₹500 flat handling cost
                  │       └── netProfit = revenue - transport - handling
                  ├── Sort mandis by netProfit (descending)
                  └── Return { mandis[], bestMandi, nearestMandi, potentialSavings, ... }
                            │
                            ▼
              Dashboard renders:
                  ├── ImpactMetrics
                  ├── RouteMap
                  ├── ProfitCards
                  └── CostBreakdown
```

---

## Data Sources

### 1. eNAM API (Live Government Data)
- **Source:** Government of India — Electronic National Agriculture Market
- **Endpoint:** `POST /web/Ajax_ctrl/trade_data_list`
- **Parameters sent:**
  - `language`: `en`
  - `stateName`: e.g., `RAJASTHAN`
  - `apmcName`: `-- Select APMCs --` (fetches all APMCs)
  - `commodityName`: e.g., `MUSTARD`, `TOMATO`
  - `fromDate` / `toDate`: Rolling 7-day window from today
- **Response fields used:** `apmc`, `state`, `modal_price`, `min_price`, `created_at`, `id`
- **Fallback:** If `modal_price` is missing, `min_price` is used

### 2. mandiCoordinates.json (Local Reference Data)
- Curated GPS coordinates for **130+ APMC markets** in Rajasthan
- Keyed as: `{ "RAJASTHAN": { "MANDI NAME": { "lat": ..., "lng": ... } } }`
- Any eNAM record whose APMC name is not found in this file is **silently skipped** to prevent bad distance calculations

### 3. mockData.json (Static Master Data)
- Vehicle definitions: type, capacity, base rate per km
- Crop catalogue: name, type string (for API query), category, perishability, shelf life in days

### 4. stateBoundaries.json (Geofencing Data)
- Polygon/boundary definitions for all Indian states
- Used by `stateDetector.js` to convert raw GPS lat/lng into a state name and its eNAM API identifier

---

## Core Algorithms

### Haversine Distance Formula

Calculates the straight-line (great-circle) distance between two geographic points on Earth's surface.

```
R = 6371 km (Earth's radius)

dLat = (lat2 - lat1) × π/180
dLon = (lon2 - lon1) × π/180

a = sin²(dLat/2) + cos(lat1) × cos(lat2) × sin²(dLon/2)
c = 2 × atan2(√a, √(1-a))

distance = R × c   (rounded to nearest km)
```

**Edge case:** If the farmer is at the exact same coordinates as a mandi (distance = 0), a safe distance of 1 km is used to prevent division-by-zero errors in profit-per-km calculations.

### Fuel-Adjusted Transport Cost

```
BASE_DIESEL_RATE = ₹90/L   (the rate at which mockData vehicle costs were calibrated)

adjustedRatePerKm = vehicle.ratePerKm × (currentDieselRate ÷ 90)

transportCost = distance × adjustedRatePerKm
```

### Net Profit Calculation

```
quantityInQuintals  =  input converted from kg / quintal / ton

revenue             =  modalPrice (₹/quintal) × quantityInQuintals
transportCost       =  distance (km) × adjustedRatePerKm (₹/km)
handlingCost        =  ₹500 (flat fee)

netProfit           =  revenue - transportCost - handlingCost
profitMargin        =  (netProfit ÷ revenue) × 100
profitPerKm         =  netProfit ÷ distance
```

---

## Component Reference

### `App.jsx`
The root entry point. Renders `<Dashboard />` inside a single `.App` wrapper div. No state or logic lives here.

---

### `Dashboard.jsx`
The central orchestrator of the application. Manages all top-level state and coordinates data flow between the API service, calculator, and child display components.

**State managed:**
| State | Type | Description |
|---|---|---|
| `tripData` | Object / null | Raw form data submitted by the user |
| `profitResults` | Object / null | Processed results from `calculateProfitability` |
| `isLoading` | Boolean | Controls spinner and disables form submit |
| `loadingStep` | Number | Index into `loadingMessages` array for animated text |
| `error` | String / null | Error message shown if API or calculation fails |

**Key behaviours:**
- On form submit → calls `fetchLivePrices` then `calculateProfitability` sequentially
- The loading text cycles through 5 messages every 800ms using `setInterval` inside a `useEffect`
- Shows a `live-badge-container` with a pulsing dot when results are displayed
- The results panel renders in this order: ImpactMetrics → RouteMap → ProfitCards → CostBreakdown

---

### `InputForm.jsx`
Handles all user input collection and validation before triggering a market search.

**Fields:**
| Field | Type | Validation |
|---|---|---|
| Crop Type | Select (grouped) | Required |
| Quantity | Number input | Required, > 0 |
| Unit | Select | quintal / ton / kg |
| Vehicle Type | Select | Required |
| Today's Diesel Rate | Number input | Required, > 0, default ₹90 |
| State / Location | Select | Required, populated from stateBoundaries.json |

**Features:**
- **Auto-Detect Location** button: triggers GPS lookup, maps to a state, and auto-fills the location field
- Inline validation with per-field error messages
- **Trip Summary card**: shows dynamically recalculated adjusted cost per km and vehicle capacity whenever a vehicle and quantity are selected
- Crop selector is split into two `<optgroup>` categories: Grains & Seeds and Fruits & Vegetables
- After detection, non-Rajasthan states are noted with an MVP limitation message

---

### `ProfitCards.jsx`
Renders one card per mandi, sorted by net profit (highest first). The top card gets a special `best-option` CSS class.

**Card contents (per mandi):**
- Market name and district
- Smart badge (Best Choice / Good Option / Fair Option / Lower Profit) based on % of maximum profit
- Price trend alert (rising/falling with %)
- Perishability warning for high-perishability crops with short shelf life
- Net profit amount + profit margin %
- Key metrics: distance, market price per quintal, transport cost
- Full revenue breakdown: Revenue → Transport → Handling → Other → Net Profit
- Historical insight label (shows "Live eNAM Price")
- Comparison note for non-best options: "₹X less than best option"

**Summary row at the bottom:**
- Total markets compared
- Maximum profit difference between best and worst
- Distance to the best market

---

### `CostBreakdown.jsx`
A dual-mode chart component for visual cost analysis using Recharts.

**Comparison View (Stacked Bar Chart):**
- X-axis: Mandi names (truncated to 15 chars, full name in tooltip)
- Y-axis: Amount in ₹ (formatted as ₹Xk)
- Bars: Revenue, Transport Cost, Handling Cost, Other Costs (stacked), Net Profit
- Custom tooltip shows full breakdown including total costs

**Distribution View (Pie Chart):**
- A dropdown lets the user select any mandi to inspect
- Pie slices: Net Profit (green), Transport Cost (red), Handling Cost (amber), Other (purple)
- Custom label renders % inside each slice
- Stat cards beside the chart: Total Revenue, Total Costs, Net Profit

**Cost Efficiency Analysis section (always shown below charts):**
- Top 3 mandis shown as efficiency cards
- Each card shows: Cost Ratio % (colour-coded green/amber/red) and Profit per km

---

## Services Reference

### `enamApi.js` — `fetchLivePrices(stateName, commodityName)`

Fetches live trading data from the eNAM government portal.

**Parameters:**
- `stateName` — State name string, e.g. `"RAJASTHAN"` (converted to uppercase internally)
- `commodityName` — Commodity name string, e.g. `"MUSTARD"` (converted to uppercase internally)

**Date window logic:**
```javascript
today      = new Date()
lastWeek   = today - 7 days
fromDate   = lastWeek  (ISO date string, YYYY-MM-DD)
toDate     = today     (ISO date string, YYYY-MM-DD)
```

**Returns:** Array of trade records, each containing `apmc`, `state`, `modal_price`, `min_price`, `created_at`, `id`

**Error handling:** Throws on non-200 HTTP response; returns `[]` if the API returns a success response with no data.

---

### `profitCalculator.js` — `calculateProfitability(tripData, liveData)`

The core business logic engine. Converts raw eNAM trade data and form inputs into a ranked list of profitable mandis.

**Input: `tripData` object**
```
{
  crop:         string   (e.g. "MUSTARD")
  quantity:     number
  unit:         string   ("quintal" | "ton" | "kg")
  vehicle:      string   (e.g. "tractor")
  dieselRate:   string   (e.g. "92.5")
  location:     string   (state name)
  originCoords: { lat, lng } | null  (from GPS detection)
}
```

**Default origin:** If `originCoords` is not provided (no GPS), defaults to **Jodhpur, Rajasthan** (lat: 26.2389, lng: 73.0243).

**Output object:**
```
{
  mandis:              MandiResult[]   (sorted by netProfit descending)
  bestMandi:           { id, name, netProfit, distance }
  nearestMandi:        MandiResult     (sorted by distance ascending)
  potentialSavings:    number          (bestMandi.netProfit - nearestMandi.netProfit)
  totalMarketsCompared:number
  cropDetails:         CropObject
  locationDetails:     { name, coordinates }
  vehicleDetails:      VehicleObject
  quantityInQuintals:  number
}
```

**MandiResult object:**
```
{
  id, name, location, district, coordinates,
  distance,       // km (Haversine)
  marketPrice,    // ₹/quintal
  revenue,        // marketPrice × quantityInQuintals
  costs: { transport, handling: 500, other: 0, total }
  netProfit,
  profitPerKm,
  profitMargin,   // %
  historicalInsight: "Live eNAM Price"
}
```

**Error cases thrown:**
- `"No live trade data found for this crop today."` — liveData is empty
- `"Prices found, but mapping coordinates are missing. Try another crop."` — all returned APMCs were filtered out due to missing coordinates
- `"Invalid vehicle selected"` / `"Invalid crop selected"` — bad form data

---

## Data Files Reference

### `mockData.json`

**Vehicles:**
| ID | Type | Name | Capacity | Base Rate/km |
|---|---|---|---|---|
| vehicle_001 | tata_ace | Tata Ace | 1 ton | ₹12 |
| vehicle_002 | tractor | Tractor Trolley | 3 ton | ₹15 |
| vehicle_003 | truck | Truck (Chhota Hathi) | 5 ton | ₹20 |

All base rates assume diesel at ₹90/L.

---

## Supported Crops

###  Grains, Seeds & Cash Crops
| Crop | API Type String | Shelf Life |
|---|---|---|
| Mustard | MUSTARD | 180 days |
| Wheat | WHEAT | 360 days |
| Guar Seeds | GUAR SEEDS | 360 days |
| Moong Whole (Green Gram) | MOONG WHOLE (GREEN GRAM) | 360 days |
| Bajra | BAJRA | 180 days |
| Castor Seed | CASTOR SEED | 180 days |
| Maize | MAIZE | 180 days |
| Cummin | CUMMIN | 360 days |
| Cotton | COTTON | 360 days |
| Jowar | JOWAR | 180 days |
| Taramira | TARAMIRA | 180 days |

###  Fruits & Vegetables
| Crop | API Type String | Shelf Life | Perishability |
|---|---|---|---|
| Cucumber | CUCUMBER | 7 days | High |
| Tomato | TOMATO | 7 days | High |
| Potato | POTATO | 30 days | Medium |
| Green Chilli | GREEN CHILLI | 10 days | High |
| Bottle Gourd | BOTTLE GOURD | 10 days | High |
| Cabbage | CABBAGE | 14 days | High |
| Onion | ONION | 45 days | Medium |

---

## Supported Markets

`mandiCoordinates.json` contains GPS coordinates for **130+ APMC/Mandi locations** across Rajasthan, including all major cities and district headquarters:

Ajmer, Alwar, Barmer, Bharatpur, Bhilwara, Bikaner, Bundi, Chittorgarh, Churu, Dausa, Dholpur, Dungarpur, Hanumangarh, Jaipur (Muhana & Grain), Jaisalmer, Jalore, Jhunjhunu, Jodhpur (F&V & Grain), Kota, Nagour, Pali, Rajsamand, Sawai Madhopur, Sikar, Sri Ganganagar, Tonk, Udaipur, and 100+ smaller APMC centres.

---

## Fuel Price Integration

This is a key feature that differentiates Krishi-Route from simpler tools. Transport costs are not fixed — they change with diesel prices every day.

**Implementation details:**
- The `InputForm` exposes a **"Today's Diesel Rate (₹/Litre)"** input field, defaulting to ₹90
- The `InputForm` Trip Summary preview recalculates and shows the adjusted ₹/km live as the farmer types
- `profitCalculator.js` applies the same scaling formula to every distance calculation
- `CostBreakdown.jsx` inherits the already-calculated transport costs, so all charts reflect the actual fuel-adjusted figure

**Example:**
```
Tractor Trolley base rate: ₹15/km (at ₹90/L diesel)

If diesel = ₹100/L:
  adjustedRate = ₹15 × (100 ÷ 90) = ₹16.67/km

If diesel = ₹80/L:
  adjustedRate = ₹15 × (80 ÷ 90) = ₹13.33/km
```

---

## eNAM API Integration

The eNAM (Electronic National Agriculture Market) is the Government of India's unified national market platform for agricultural commodities. Krishi-Route queries it via a POST form-data request.

**Why 7 days?** Not all mandis report prices every single day. Fetching only today's data would miss many active markets. The 7-day window significantly increases the number of mandis returned, giving farmers more options to compare.

**Date formatting:** The API expects `YYYY-MM-DD` format. Response dates come back as `"2026-02-25"` strings and are reformatted to `"Feb 25"` using `toLocaleDateString` for display in mandi card names.

**Proxy requirement:** The API endpoint is a relative path (`/web/Ajax_ctrl/trade_data_list`), meaning the React dev server (or production host) must be configured to proxy requests to the actual eNAM domain to avoid CORS errors.

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- npm or yarn

### Install & Run
```bash
# Clone the repository
git clone https://github.com/RawatSinghMayank/Krishi-Route---Profit-Logistics-Optimizer.git
cd krishi-route

# Install dependencies
npm install

# Configure the eNAM API proxy in vite.config.js

# Start the development server
npm run dev
```

### Environment Notes
- No `.env` file is currently required — the API URL is a relative path handled by the Vite proxy
- The app will work in offline/demo mode only if mock data fallback is re-enabled in `profitCalculator.js`

---

## Current Limitations & MVP Scope

| Limitation | Detail |
|---|---|
| **State coverage** | Only Rajasthan mandis have GPS coordinates. Other states auto-default to Rajasthan. |
| **Distance type** | Haversine gives straight-line distance. |
| **Handling cost** | Fixed at ₹500 flat.  |
| **Vehicles** | Only 3 vehicle types supported. |
| **Prices** | Uses modal (most common) price. Min/max price range is not surfaced to the user. |
| **Historical trends** | Price trend alerts (`priceAlert`, `perishabilityWarning`) are defined in the data model. |
| **Language** | English only. No Hindi/regional language support yet. |

---

## Future Roadmap

- **Road distance routing** — Integrate Google Maps / OSRM API for actual driving distances
- **Multi-state support** — Expand `mandiCoordinates.json` to cover all Indian states
- **Price trend analysis** — Use 7-day historical data to compute and display rising/falling trends
- **Mandi fee database** — Replace the flat ₹500 handling cost with actual APMC-specific commission rates
- **Offline PWA mode** — Cache last results for use in low-connectivity rural areas
- **Hindi language support** — Full UI translation for wider farmer adoption
- **SMS/WhatsApp alert** — Notify farmers when prices rise above a threshold at nearby mandis

---

## License

This project was built as part of AjraSakha Hackathon to empower Indian farmers with data-driven market decisions.

---

