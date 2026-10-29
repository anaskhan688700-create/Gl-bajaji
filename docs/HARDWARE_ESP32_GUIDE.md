# KisanRakshak AI — ESP32 Hardware Integration Guide

This guide describes the hardware specification, pinout architecture, and transmission protocol for physical sensor nodes communicating with **KisanRakshak AI**.

---

## 1. Hardware Architecture Overview

- **Microcontroller**: ESP32-WROOM-32D / ESP32-S3 (with integrated 2.4 GHz WiFi & BLE)
- **Power Subsystem**: 3.7V 18650 Li-ion battery (2600 mAh) paired with a 5V 2W Monocrystalline Solar Panel and TP4056 charging module with battery protection.
- **Sleep Strategy**: ESP32 deep sleep mode (drawing ~15 µA) waking up every 15 minutes to take burst readings, transmit JSON payload over HTTP/TLS, and return to sleep. Estimated battery runtime without solar: ~45 days.

---

## 2. Sensor Pinout & Wiring Specification

| Sensor Module | Physical Parameter | Interface | ESP32 GPIO Pin | Operating Voltage |
|---|---|---|---|---|
| Capacitive Soil Moisture v2.0 | Volumetric Water Content (%) | Analog (ADC1) | **GPIO 34** | 3.3V |
| DS18B20 Stainless Probe | Soil Temperature (°C) | 1-Wire (with 4.7kΩ pull-up) | **GPIO 4** | 3.3V |
| SHT31 / SHT30 | Ambient Temp (°C) & Humidity (%) | I2C (SDA) | **GPIO 21** | 3.3V |
| SHT31 / SHT30 | Ambient Temp (°C) & Humidity (%) | I2C (SCL) | **GPIO 22** | 3.3V |
| Analog Soil pH Electrode Probe | Soil Acidity/Alkalinity | Analog (ADC1) | **GPIO 35** | 5.0V / 3.3V via voltage divider |
| Optical Leaf Wetness Grid | Dew / Wet Foliage Index (%) | Analog (ADC1) | **GPIO 32** | 3.3V |
| Battery Voltage Monitor | Battery Health (3.2V - 4.2V) | Analog (100kΩ / 100kΩ divider) | **GPIO 33** | Li-ion VCC |

> [!IMPORTANT]
> Always use ADC1 pins (GPIO 32 to 39) on the ESP32 when reading analog voltages while WiFi is active. ADC2 channels cannot be used concurrently with WiFi.

---

## 3. Ingestion API Protocol

### Endpoint
```http
POST /api/v1/sensors/ingest HTTP/1.1
Host: your-server-ip:5000
Content-Type: application/json
X-Device-Token: kr_live_token_karnal_01
```

### JSON Request Payload
```json
{
  "deviceId": "ESP32-KR-001",
  "farmId": "farm-01",
  "soilMoisture": 44.5,
  "soilTemperature": 20.8,
  "ambientTemperature": 23.1,
  "relativeHumidity": 61.5,
  "soilPh": 6.82,
  "nitrogen": 135,
  "phosphorus": 24,
  "potassium": 195,
  "leafWetness": 14.0,
  "rainfallMm": 0.0,
  "batteryVoltage": 3.96
}
```

### Verification & Validation Protocol
- If `X-Device-Token` is missing or invalid: returns `401 Unauthorized`.
- If numeric values exceed physical bounds (e.g., moisture > 100%, temperature > 65°C, pH < 2.0 or > 12.0): returns `400 Bad Request` and increments the invalid packet counter on the device record.
- If payload is accepted: returns `201 Created` with reading ID and immediately evaluates crop stage thresholds.

---

## 4. Quick Testing via cURL

```bash
curl -X POST http://localhost:5000/api/v1/sensors/ingest \
  -H "Content-Type: application/json" \
  -H "X-Device-Token: kr_live_token_karnal_01" \
  -d '{
    "deviceId": "ESP32-KR-001",
    "soilMoisture": 45.0,
    "soilTemperature": 21.0,
    "ambientTemperature": 23.5,
    "relativeHumidity": 62.0,
    "soilPh": 6.85,
    "batteryVoltage": 3.98
  }'
```

