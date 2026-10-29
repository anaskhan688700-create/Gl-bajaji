# KisanRakshak AI — Hackathon Demonstration Guide

This document outlines the 5 core demo scenarios designed for judges to test and verify during evaluation.

---

## Scenario A: Water Stress Warning
- **Trigger**: Click **Scenario A** on the Topbar quick-test buttons or Sensor Monitoring page.
- **Expected Behavior**:
  - Root-zone soil moisture drops to **22.4%**, which is below the safe threshold of 38% for wheat during the "Flowering / Boot Stage".
  - The dashboard updates the Field Health Score to High Risk / Critical.
  - An explainable alert appears:
    - *Observed Evidence*: Root-zone Moisture: 22.4% (Target: 50% - 75%)
    - *Explanation*: "Soil moisture at root depth is 22.4%, critically below the safe threshold for the Flowering stage. Drought stress at this stage will impair yield potential."
    - *Recommended Action*: "Initiate targeted irrigation within 24 hours. Verify physical soil texture at 15cm and 30cm depth."

---

## Scenario B: Environmental Risk (Microclimate Fungal Disease Window)
- **Trigger**: Click **Scenario B** on the Topbar quick-test buttons.
- **Expected Behavior**:
  - Ambient humidity rises to **88%**, leaf wetness rises to **82%**, ambient temperature settles at **19.5°C**.
  - Crop Health engine evaluates microclimate against ICAR disease triggers and raises an environmental warning:
    - *Title*: "Environmental Conditions Favorable for Stripe Rust / Yellow Rust (Puccinia striiformis)"
    - *Safety Notice*: Clarifies explicitly that this is an *environmental risk indicator*, NOT a confirmed plant diagnosis.
    - *Recommended Action*: "Scout field corners. Rub finger over leaf surface to check for yellow spores. Spray Propiconazole 25% EC (1ml/L) only if pustules confirmed on >5% of plants."

---

## Scenario C: Next-Season Crop Planning
- **Navigation**: Click **AI Crop Advisor** in the left sidebar.
- **Interaction**:
  - Configure season to **Rabi**, soil to **Loam**, irrigation to **Tube Well**, and previous crop to **Paddy**.
  - System executes the multi-factor suitability scoring model and outputs candidate crops:
    - #1: **Wheat (गेहूँ)** — 92% suitability
    - #2: **Mustard (सरसों)** — 88% suitability
    - #3: **Chickpea (चना)** — 84% suitability
  - Each crop displays:
    - Hindi and English names
    - Dimensional score breakdown (Soil, Season, Water, Rotation, Budget)
    - Full economics (production cost/acre, expected yield, gross revenue, net profit)
    - Explicit caveats (e.g., "Soil pH was not provided; recommendation assumes neutral 6.5-7.5 pH").

---

## Scenario D: Crop Economics & Trade-Offs
- **Navigation**: Click **Crop Comparison** or **Profit Calculator** in the left sidebar.
- **Interaction**:
  - Compare **Wheat** vs **Mustard** vs **Chickpea** side by side.
  - Adjust the Yield Scenario (Optimal +20% vs Adverse -20%) and Selling Price.
  - The trade-off summary highlights:
    - Highest Net Return: Wheat / Vegetable
    - Lowest Water Consumption: Chickpea (200-350 mm)
    - Lowest Initial Capital Cost: Chickpea (₹10,800/acre)

---

## Scenario E: Device Offline & Stale Data Warning
- **Trigger**: Click **Scenario E** on the Topbar.
- **Expected Behavior**:
  - Node `ESP32-KR-001` stops transmitting new telemetry and is marked as **OFFLINE** (Last seen 4 hours ago, Battery 8%).
  - The dashboard displays a **Stale Sensor Data** alert explaining that current field conditions cannot be verified.
  - Advises the farmer to inspect physical hardware power and network connectivity before making irrigation decisions.

