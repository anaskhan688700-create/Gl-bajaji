# KisanRakshak AI (किसानरक्षक AI)
### Intelligent Crop Protection & Multi-Factor Crop Planning for Indian Farmers

![KisanRakshak AI Architecture](https://img.shields.io/badge/Platform-Full--Stack%20Web%20%2B%20IoT%20Gateway-25834B)
![Build Status](https://img.shields.io/badge/Tests-10%20Passed-brightgreen)
![Node Version](https://img.shields.io/badge/Node-v26.13-blue)
![Localization](https://img.shields.io/badge/Languages-Hindi%20%26%20English-163D2B)

---

## 1. Project Overview & Vision

**KisanRakshak AI** is an intelligent crop-protection and crop-planning platform built specifically for Indian farmers, agronomists, and agricultural researchers.

### Core Problem
Indian smallholders face severe crop stress from sudden drought periods, unseasonal rain, and fungal disease epidemics. Simultaneously, planning the next season's crop is typically based on guesswork without considering soil compatibility, water availability, crop rotation benefits, and itemized financial return.

### Core Differentiator
KisanRakshak AI **combines current-crop risk monitoring with next-season crop suitability recommendations** in one unified, farmer-friendly, bilingual system.

> [!NOTE]
> All agronomic benchmarks and crop thresholds are structured following validated recommendations from the **Indian Council of Agricultural Research (ICAR)** and State Agricultural Universities.

---

## 2. Key Features Implemented

1. **Responsive Nature-Inspired UI/UX Design System**:
   - Deep forest green (`#163D2B`), Agricultural green (`#25834B`), Fresh lime accent (`#B5E853`), and warm off-white (`#F7F8F2`).
   - Clean collapsible sidebar on desktop, responsive mobile drawer, accessible contrast, and Devanagari typography support.
2. **Full Bilingual Localization (हिन्दी & English)**:
   - Complete toggle for all navigation items, metrics, alert explanations, economics, and chat assistant.
3. **IoT Sensor Monitoring (Live Hardware + Simulation Sandbox)**:
   - Real-time and historical telemetry for Soil Moisture, Soil Temperature, Ambient Temp, Relative Humidity, Soil pH, NPK, Leaf Wetness, and Battery Voltage.
   - 1h, 24h, and 7d historical Recharts graphs.
   - Dual mode: **Verified Live Hardware Mode** via authenticated REST API (`POST /api/v1/sensors/ingest`) and **Simulated Demo Mode** with 5 interactive field scenarios.
4. **Crop-Specific Early Warning Rules Engine**:
   - Transparent evaluation of water stress, excess moisture/waterlogging, thermal heat stress, and fungal disease microclimates for 10+ Indian crops (Wheat, Paddy, Mustard, Cotton, Tomato, Potato, Chickpea, Sugarcane, Maize, Soybean).
   - Evidence-based risk flags: Observed reading vs stage target vs recommended preventive action.
   - Explicit distinction between sensor readings, rule flags, and confirmed disease diagnoses.
5. **AI Next-Season Crop Advisor**:
   - Multi-factor suitability algorithm considering soil texture, soil pH, target season, irrigation availability, previous crop rotation synergy, and farmer budget.
   - Ranked candidate shortlist with dimensional score breakdowns and missing data caveats.
6. **Side-by-Side Crop Comparison**:
   - Compare 2 to 4 candidate crops side by side with adjustable yield multipliers and custom mandi prices.
   - Trade-off analysis highlights (Highest net return, Lowest water consumption, Lowest initial capital cost).
7. **Agro-Meteorological Weather Center**:
   - 5-Day forecast, rainfall probability, optimal foliar spray window alerts, and night dew indices.
8. **Itemized Profit & Farming Cost Calculator**:
   - Land area unit toggle (Acres, Hectares, Bighas).
   - Itemized expense tracking (Seed, Fertilizer, Irrigation, Labor, Machinery, Crop Protection, Logistics).
   - Computes Gross Revenue, Estimated Net Return, Cost per Quintal, and Break-Even Selling Price.
9. **Bilingual AI Kisan Assistant**:
   - Interactive chat in Hindi and English.
   - Automatic injection of active farm context, recent telemetry, and active alerts.
   - Pre-configured high-impact questions and ICAR citations.
10. **Crop Image Analysis (Leaf Diagnostic Scanner)**:
    - Photo upload and preview with crop and stage selection.
    - Pattern matching against verified diagnostic catalog with confidence levels and mandatory field inspection steps.
11. **Device & Hardware Management**:
    - Device registry, battery health, token generation, invalid packet diagnostics.
    - Interactive live packet transmission sandbox.
    - Complete ESP32 Arduino C++ firmware snippet and pinout wiring diagram.
12. **Admin & Agronomist Dashboard**:
    - System metrics, registered nodes, audit logs, and dynamic threshold tuning editor.
13. **Reports & Data Export**:
    - Filterable history with one-click downloadable CSV export and print-ready summary.

---

## 3. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, React Router v6.
- **Backend**: Node.js & Express REST API with TypeScript execution (`tsx`), CORS, Multer.
- **Persistence**: File-based JSON database with atomic writes (`server/data/db.json`), pre-seeded with realistic Indian farming records.
- **Testing**: Vitest test runner with unit and integration tests.

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18+ or v26 LTS)
- npm or pnpm

### 1. Clone & Install Dependencies
```bash
cd "c:\Users\intel\GL bajaj project Anas"
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
```
All 10 unit and integration tests will execute and verify calculation accuracy, unit conversions, rules engine alerts, and hardware ingestion boundaries.

### 3. Run the Full-Stack Application
```bash
# Option A: Start unified server (serves frontend + backend on port 5000)
npm run build
npm start

# Option B: Run Vite development mode (port 5173 with proxy to port 5000)
npm run server   # in terminal 1
npm run dev      # in terminal 2
```

Open `http://localhost:5000` (or `http://localhost:5173` in dev mode) in your browser.

---

## 5. Live vs Simulated Hardware Modes

| Feature | Live Hardware Mode | Simulation / Demo Mode |
|---|---|---|
| **Data Ingestion** | Authenticated REST `POST /api/v1/sensors/ingest` | Background diurnal telemetry simulator |
| **Badge** | `LIVE HARDWARE` | `DEMO DATA` |
| **Sensor Node** | Physical ESP32 / Arduino node | Virtual node with scenario injection |
| **Validation** | Numeric range checks; rejects invalid packets | Guaranteed within physical bounds |

---

## 6. Pre-Seeded Demo Accounts for Judges

- **Farmer Role**: `Ramesh Kumar` (Karnal, Haryana — 4.0 Acres Wheat plot)
  - One-click access via Topbar user menu: **👨‍🌾 Demo Farmer**
- **Admin / Agronomist Role**: `Dr. Priya Sharma` (Central Delhi / KVK Coordinator)
  - One-click access via Topbar user menu: **🔬 Demo Admin**

---

## 7. Folder Structure

```
kisanrakshak-ai/
├── docs/
│   ├── HARDWARE_ESP32_GUIDE.md    # ESP32 pinouts, circuit wiring, Arduino code
│   └── DEMO_SCENARIOS.md          # 5 Hackathon demo scenario instructions
├── server/
│   ├── data/
│   │   ├── cropsData.ts           # ICAR agronomic benchmarks for 10+ crops
│   │   └── db.json                # Seed database (farms, devices, telemetry)
│   ├── routes/                    # REST API endpoints
│   ├── services/
│   │   ├── rulesEngine.ts         # Transparent crop early-warning engine
│   │   ├── suitabilityEngine.ts   # Multi-factor crop recommendation engine
│   │   ├── simulationService.ts   # 5-scenario telemetry simulator
│   │   ├── assistantService.ts    # Bilingual AI Kisan Assistant
│   │   └── storage.ts             # Atomic JSON persistence service
│   ├── tests/                     # Vitest test suites (10 passed)
│   └── index.ts                   # Express server entrypoint
├── src/
│   ├── components/                # Layout, Topbar, Sidebar, MetricCard, AlertBanner
│   ├── context/                   # Auth, Farm, Sensor, Language contexts
│   ├── i18n/                      # Bilingual Hindi & English dictionary
│   ├── pages/                     # 18 fully implemented application pages
│   ├── types/                     # TypeScript data contracts
│   ├── App.tsx                    # React Router configuration
│   └── main.tsx                   # React root entrypoint
├── package.json
├── tailwind.config.js             # Custom agricultural palette
├── vite.config.ts
└── README.md
```

---

## 8. License & Acknowledgements
- Developed for the **VECNAVERSE Hackathon**.
- Crop physiological parameters adapted from ICAR publications (ICAR-IIWBR, ICAR-NRRI, ICAR-CICR, ICAR-DRMR, ICAR-IIPR).

