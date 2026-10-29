import { Router } from 'express';
import { storage, DeviceRecord } from '../services/storage';

const router = Router();

// List all devices
router.get('/', (req, res) => {
  res.json({
    success: true,
    devices: storage.getDevices(),
  });
});

// Get single device
router.get('/:id', (req, res) => {
  const device = storage.getDeviceById(req.params.id);
  if (!device) {
    return res.status(404).json({ success: false, message: 'Device not found.' });
  }
  res.json({ success: true, device });
});

// Register new device
router.post('/', (req, res) => {
  const { id, name, farmId, hardwareModel, installedSensors } = req.body;
  if (!id || !name) {
    return res.status(400).json({ success: false, message: 'Device ID and Name are required.' });
  }

  const generatedToken = `kr_hw_live_${Math.random().toString(36).substring(2, 12)}`;
  const newDevice: DeviceRecord = {
    id,
    name,
    farmId,
    status: 'ONLINE',
    lastSeen: new Date().toISOString(),
    batteryPercentage: 100,
    firmwareVersion: 'v1.4.2-esp32',
    token: generatedToken,
    hardwareModel: hardwareModel || 'ESP32 Agricultural Node',
    installedSensors: installedSensors || ['Soil Moisture', 'Soil Temp', 'Ambient Temp/RH'],
    invalidPayloadCount: 0,
  };

  storage.registerDevice(newDevice);
  storage.addAuditLog('Admin', 'DEVICE_REGISTER', `Registered new device ${newDevice.id} (${newDevice.name})`);

  res.status(201).json({
    success: true,
    device: newDevice,
    message: 'Device successfully registered.',
  });
});

// Firmware specification and ESP32 Arduino code sample
router.get('/firmware/spec', (req, res) => {
  const samplePayload = {
    deviceId: 'ESP32-KR-001',
    soilMoisture: 42.5,
    soilTemperature: 19.8,
    ambientTemperature: 22.3,
    relativeHumidity: 61.2,
    soilPh: 6.85,
    nitrogen: 135,
    phosphorus: 24,
    potassium: 195,
    leafWetness: 14.0,
    rainfallMm: 0.0,
    batteryVoltage: 3.96,
  };

  const sampleArduinoCode = `/*
  KisanRakshak AI — ESP32 Sensor Node Ingestion Firmware
  Hardware: ESP32-WROOM-32D / ESP32-S3
  Sensors: Capacitive Soil Moisture v2.0 (ADC GPIO34)
           DS18B20 Soil Temp (OneWire GPIO4)
           SHT31 Ambient Temp & Humidity (I2C SDA 21, SCL 22)
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverEndpoint = "http://YOUR_SERVER_IP:5000/api/v1/sensors/ingest";
const char* deviceToken = "kr_live_token_karnal_01";
const char* deviceId = "ESP32-KR-001";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("X-Device-Token", deviceToken);

    // Read Sensors (replace with actual ADC & I2C reads)
    float rawMoisture = analogRead(34);
    float soilMoisturePct = map(rawMoisture, 3200, 1400, 0, 100);
    soilMoisturePct = constrain(soilMoisturePct, 0.0, 100.0);

    StaticJsonDocument<512> doc;
    doc["deviceId"] = deviceId;
    doc["soilMoisture"] = soilMoisturePct;
    doc["soilTemperature"] = 20.4;
    doc["ambientTemperature"] = 22.8;
    doc["relativeHumidity"] = 62.0;
    doc["soilPh"] = 6.8;
    doc["batteryVoltage"] = 3.95;

    String requestBody;
    serializeJson(doc, requestBody);

    int httpCode = http.POST(requestBody);
    Serial.printf("HTTP Response code: %d\\n", httpCode);
    http.end();
  }
  // Deep sleep for 15 minutes to conserve battery
  esp_sleep_enable_timer_wakeup(15 * 60 * 1000000ULL);
  esp_deep_sleep_start();
}
`;

  res.json({
    success: true,
    protocol: 'HTTP REST / JSON over TLS or WiFi',
    endpoint: 'POST /api/v1/sensors/ingest',
    headersRequired: {
      'Content-Type': 'application/json',
      'X-Device-Token': '<DEVICE_TOKEN>',
    },
    samplePayload,
    sampleArduinoCode,
  });
});

export default router;

