import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'farmer' | 'admin' | 'agronomist';
  preferredLanguage: 'en' | 'hi';
  state: string;
  district: string;
  createdAt: string;
}

export interface FarmRecord {
  id: string;
  userId: string;
  name: string;
  location: {
    state: string;
    district: string;
    villageOrBlock?: string;
    coordinates?: { lat: number; lng: number };
  };
  area: number;
  areaUnit: 'Acre' | 'Hectare' | 'Bigha';
  soilType: string;
  irrigationMethod: 'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Tube Well' | 'Rainfed';
  currentCropId: string;
  cropVariety?: string;
  sowingDate: string;
  expectedHarvestDate: string;
  growthStage: string;
  assignedDeviceId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SensorTelemetry {
  id: string;
  deviceId: string;
  farmId: string;
  timestamp: string; // ISO 8601
  soilMoisture: number; // % (0 - 100)
  soilTemperature: number; // °C (0 - 55)
  ambientTemperature: number; // °C (-10 - 55)
  relativeHumidity: number; // % (0 - 100)
  soilPh: number; // (3.5 - 10.0)
  nitrogen?: number; // mg/kg
  phosphorus?: number; // mg/kg
  potassium?: number; // mg/kg
  leafWetness?: number; // % (0 - 100)
  lightIntensityLux?: number; // Lux
  rainfallMm?: number; // mm
  batteryVoltage?: number; // V (3.2 - 4.2)
  isSimulated: boolean;
  dataQuality: 'High' | 'Good' | 'Stale' | 'Anomalous';
}

export interface RiskAlertRecord {
  id: string;
  farmId: string;
  cropId: string;
  growthStage: string;
  severity: 'Normal' | 'Watch' | 'High risk' | 'Insufficient data';
  titleEn: string;
  titleHi: string;
  explanationEn: string;
  explanationHi: string;
  evidence: {
    parameter: string;
    observedValue: string | number;
    thresholdExpected: string;
    sensorSource: string;
  }[];
  recommendedActionEn: string;
  recommendedActionHi: string;
  dataQuality: 'High' | 'Good' | 'Degraded' | 'Stale' | 'Anomalous';
  confidenceLevel: 'High' | 'Moderate' | 'Provisional';
  timestamp: string;
  isRead: boolean;
  active: boolean;
}

export interface DeviceRecord {
  id: string;
  name: string;
  farmId?: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  lastSeen: string;
  batteryPercentage: number;
  firmwareVersion: string;
  token: string;
  hardwareModel: string;
  installedSensors: string[];
  invalidPayloadCount: number;
}

export interface DatabaseSchema {
  users: UserRecord[];
  farms: FarmRecord[];
  devices: DeviceRecord[];
  telemetry: SensorTelemetry[];
  alerts: RiskAlertRecord[];
  simulationState: {
    isRunning: boolean;
    activeScenario: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'SCENARIO_D' | 'SCENARIO_E' | 'NORMAL';
    lastTickedAt: string;
  };
  auditLogs: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    details: string;
  }[];
}

const DB_FILE_PATH = path.resolve(process.cwd(), 'server', 'data', 'db.json');

function generateInitialTelemetry(farmId: string, deviceId: string): SensorTelemetry[] {
  const readings: SensorTelemetry[] = [];
  const now = Date.now();
  // Generate 24 hourly readings backwards
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now - i * 60 * 60 * 1000).toISOString();
    // Simulate diurnal variation
    const hour = new Date(now - i * 60 * 60 * 1000).getHours();
    const tempVariation = Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 4.5;
    const humidityVariation = -Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 15;

    readings.push({
      id: `tel-${farmId}-${i}`,
      deviceId,
      farmId,
      timestamp: time,
      soilMoisture: Math.round((38 + Math.sin(i / 3) * 3) * 10) / 10,
      soilTemperature: Math.round((19 + tempVariation * 0.4) * 10) / 10,
      ambientTemperature: Math.round((21 + tempVariation) * 10) / 10,
      relativeHumidity: Math.round((58 + humidityVariation) * 10) / 10,
      soilPh: 6.8,
      nitrogen: 135,
      phosphorus: 24,
      potassium: 195,
      leafWetness: hour >= 2 && hour <= 7 ? 68 : 12,
      lightIntensityLux: hour >= 6 && hour <= 18 ? 35000 : 0,
      rainfallMm: 0,
      batteryVoltage: 3.95,
      isSimulated: true,
      dataQuality: 'High',
    });
  }
  return readings;
}

const INITIAL_DB: DatabaseSchema = {
  users: [
    {
      id: 'usr-farmer-01',
      name: 'Ramesh Kumar',
      email: 'ramesh@kisanrakshak.in',
      phone: '+91 98765 43210',
      role: 'farmer',
      preferredLanguage: 'hi',
      state: 'Haryana',
      district: 'Karnal',
      createdAt: '2024-01-15T08:00:00Z',
    },
    {
      id: 'usr-admin-01',
      name: 'Dr. Priya Sharma (Agronomist)',
      email: 'admin@kisanrakshak.in',
      phone: '+91 98111 22334',
      role: 'admin',
      preferredLanguage: 'en',
      state: 'New Delhi',
      district: 'Central Delhi',
      createdAt: '2024-01-01T08:00:00Z',
    },
  ],
  farms: [
    {
      id: 'farm-01',
      userId: 'usr-farmer-01',
      name: 'Shri Ram Krishi Farm',
      location: {
        state: 'Haryana',
        district: 'Karnal',
        villageOrBlock: 'Nilokheri Block',
        coordinates: { lat: 29.8016, lng: 76.9232 },
      },
      area: 4.0,
      areaUnit: 'Acre',
      soilType: 'Loam',
      irrigationMethod: 'Tube Well',
      currentCropId: 'wheat',
      cropVariety: 'HD-3086 (Pusa Gautami)',
      sowingDate: '2024-11-10',
      expectedHarvestDate: '2025-04-05',
      growthStage: 'Flowering / Boot Stage (70-80 DAS)',
      assignedDeviceId: 'ESP32-KR-001',
      notes: 'Tubewell water has normal salinity; applied first urea dose at 25 DAS.',
      createdAt: '2024-11-01T10:00:00Z',
      updatedAt: '2024-11-20T10:00:00Z',
    },
    {
      id: 'farm-02',
      userId: 'usr-farmer-01',
      name: 'Godavari Valley Plot B',
      location: {
        state: 'Maharashtra',
        district: 'Nashik',
        villageOrBlock: 'Dindori Taluka',
        coordinates: { lat: 20.0059, lng: 73.7898 },
      },
      area: 2.5,
      areaUnit: 'Acre',
      soilType: 'Black Soil (Regur)',
      irrigationMethod: 'Drip',
      currentCropId: 'tomato',
      cropVariety: 'Abhinav Hybrid',
      sowingDate: '2024-10-15',
      expectedHarvestDate: '2025-02-15',
      growthStage: 'Flowering & Fruit Set',
      assignedDeviceId: 'ESP32-KR-002',
      notes: 'Fertigation system integrated with drip lines; monitoring for fruit borer.',
      createdAt: '2024-10-05T09:00:00Z',
      updatedAt: '2024-10-25T11:00:00Z',
    },
    {
      id: 'farm-03',
      userId: 'usr-farmer-01',
      name: 'Green Meadows Acre 3',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        villageOrBlock: 'Samrala',
        coordinates: { lat: 30.901, lng: 75.8573 },
      },
      area: 5.0,
      areaUnit: 'Acre',
      soilType: 'Alluvial',
      irrigationMethod: 'Canal / Flood',
      currentCropId: 'mustard',
      cropVariety: 'Pusa Bold',
      sowingDate: '2024-10-22',
      expectedHarvestDate: '2025-03-01',
      growthStage: 'Pod Development (Siliquae)',
      assignedDeviceId: 'ESP32-KR-003',
      notes: 'Planted as zero-tillage mustard post short duration rice.',
      createdAt: '2024-10-18T10:00:00Z',
      updatedAt: '2024-10-28T09:30:00Z',
    },
  ],
  devices: [
    {
      id: 'ESP32-KR-001',
      name: 'Field Sensor Node #1 (Karnal)',
      farmId: 'farm-01',
      status: 'ONLINE',
      lastSeen: new Date().toISOString(),
      batteryPercentage: 94,
      firmwareVersion: 'v1.4.2-esp32',
      token: 'kr_live_token_karnal_01',
      hardwareModel: 'ESP32-WROOM-32D Agricultural Pro',
      installedSensors: [
        'Capacitive Soil Moisture v2.0',
        'DS18B20 Soil Temperature',
        'SHT31 Ambient Temp & Humidity',
        'Analog Soil pH Probe',
        'Optical Leaf Wetness Grid',
      ],
      invalidPayloadCount: 0,
    },
    {
      id: 'ESP32-KR-002',
      name: 'Drip Node #2 (Nashik)',
      farmId: 'farm-02',
      status: 'ONLINE',
      lastSeen: new Date().toISOString(),
      batteryPercentage: 88,
      firmwareVersion: 'v1.4.2-esp32',
      token: 'kr_live_token_nashik_02',
      hardwareModel: 'ESP32-S3 Agricultural LoRa/WiFi',
      installedSensors: [
        'Capacitive Soil Moisture v2.0',
        'DS18B20 Soil Temperature',
        'SHT31 Ambient Temp & Humidity',
        'Analog Soil pH Probe',
      ],
      invalidPayloadCount: 0,
    },
    {
      id: 'ESP32-KR-003',
      name: 'Canal Node #3 (Ludhiana)',
      farmId: 'farm-03',
      status: 'OFFLINE',
      lastSeen: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString(),
      batteryPercentage: 12,
      firmwareVersion: 'v1.3.9-esp32',
      token: 'kr_live_token_ludhiana_03',
      hardwareModel: 'ESP32 Standard DevKit',
      installedSensors: [
        'Capacitive Soil Moisture v1.2',
        'DHT22 Ambient Temp & Humidity',
      ],
      invalidPayloadCount: 2,
    },
  ],
  telemetry: [],
  alerts: [
    {
      id: 'alert-initial-01',
      farmId: 'farm-01',
      cropId: 'wheat',
      growthStage: 'Flowering / Boot Stage (70-80 DAS)',
      severity: 'Watch',
      titleEn: 'Soil Moisture Approaching Lower Threshold for Flowering Stage',
      titleHi: 'फूल आने की अवस्था में मिट्टी की नमी निचली सीमा के करीब',
      explanationEn: 'Soil moisture is currently at 38%, which is near the lower safe margin (50-75% optimal, alert < 38%) for wheat booting and flowering. Stress during flowering can reduce ear head grain count.',
      explanationHi: 'वर्तमान में मिट्टी की नमी 38% है, जो गेहूँ की बालियां निकलने की अवस्था के लिए न्यूनतम सीमा (50-75% उचित) के पास है। इस समय नमी की कमी से दानों की संख्या प्रभावित हो सकती है।',
      evidence: [
        { parameter: 'Soil Moisture', observedValue: '38%', thresholdExpected: '50% - 75%', sensorSource: 'Capacitive Soil Moisture Sensor' },
        { parameter: 'Ambient Temp', observedValue: '21.4°C', thresholdExpected: '12°C - 25°C', sensorSource: 'SHT31 Sensor' },
      ],
      recommendedActionEn: 'Inspect soil moisture at 15cm and 30cm root depth; plan light irrigation within the next 48 hours if no rainfall is forecasted.',
      recommendedActionHi: '15 सेमी और 30 सेमी जड़ गहराई पर नमी की जांच करें; अगले 48 घंटों में हल्की सिंचाई की योजना बनाएं।',
      dataQuality: 'High',
      confidenceLevel: 'High',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false,
      active: true,
    },
  ],
  simulationState: {
    isRunning: true,
    activeScenario: 'NORMAL',
    lastTickedAt: new Date().toISOString(),
  },
  auditLogs: [
    {
      id: 'log-01',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      actor: 'System Auto-Init',
      action: 'DATABASE_INITIALIZATION',
      details: 'Initialized seed records for KisanRakshak AI prototype with ICAR benchmark thresholds.',
    },
  ],
};

// Fill initial telemetry
INITIAL_DB.telemetry = [
  ...generateInitialTelemetry('farm-01', 'ESP32-KR-001'),
  ...generateInitialTelemetry('farm-02', 'ESP32-KR-002'),
];

export class StorageService {
  private static instance: StorageService;
  private db: DatabaseSchema;

  private constructor() {
    this.db = this.loadDatabase();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Error reading db.json, falling back to seed database:', err);
    }

    // Save initial DB
    this.saveDatabase(INITIAL_DB);
    return INITIAL_DB;
  }

  public saveDatabase(data?: DatabaseSchema): void {
    if (data) this.db = data;
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.db, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.db;
  }

  // Users
  public getUsers(): UserRecord[] {
    return this.db.users;
  }

  public getUserById(id: string): UserRecord | undefined {
    return this.db.users.find(u => u.id === id);
  }

  public addUser(user: UserRecord): void {
    this.db.users.push(user);
    this.saveDatabase();
  }

  // Farms
  public getFarms(): FarmRecord[] {
    return this.db.farms;
  }

  public getFarmById(id: string): FarmRecord | undefined {
    return this.db.farms.find(f => f.id === id);
  }

  public addFarm(farm: FarmRecord): void {
    this.db.farms.push(farm);
    // Also create initial telemetry for new farm
    const devId = farm.assignedDeviceId || `ESP32-VIRTUAL-${Date.now().toString().slice(-4)}`;
    const newTelemetry = generateInitialTelemetry(farm.id, devId);
    this.db.telemetry.push(...newTelemetry);
    this.saveDatabase();
  }

  public updateFarm(id: string, updates: Partial<FarmRecord>): FarmRecord | null {
    const idx = this.db.farms.findIndex(f => f.id === id);
    if (idx === -1) return null;
    this.db.farms[idx] = {
      ...this.db.farms[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveDatabase();
    return this.db.farms[idx];
  }

  public deleteFarm(id: string): boolean {
    const initialLen = this.db.farms.length;
    this.db.farms = this.db.farms.filter(f => f.id !== id);
    this.db.telemetry = this.db.telemetry.filter(t => t.farmId !== id);
    this.db.alerts = this.db.alerts.filter(a => a.farmId !== id);
    this.saveDatabase();
    return this.db.farms.length < initialLen;
  }

  // Telemetry
  public getLatestTelemetry(farmId: string): SensorTelemetry | undefined {
    const list = this.db.telemetry
      .filter(t => t.farmId === farmId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return list[0];
  }

  public getTelemetryHistory(farmId: string, limit = 50): SensorTelemetry[] {
    return this.db.telemetry
      .filter(t => t.farmId === farmId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-limit);
  }

  public addTelemetry(record: SensorTelemetry): void {
    this.db.telemetry.push(record);
    // Keep max 1000 items in memory/disk to prevent unlimited growth
    if (this.db.telemetry.length > 1000) {
      this.db.telemetry = this.db.telemetry.slice(-800);
    }
    this.saveDatabase();
  }

  // Devices
  public getDevices(): DeviceRecord[] {
    return this.db.devices;
  }

  public getDeviceById(id: string): DeviceRecord | undefined {
    return this.db.devices.find(d => d.id === id);
  }

  public getDeviceByToken(token: string): DeviceRecord | undefined {
    return this.db.devices.find(d => d.token === token);
  }

  public updateDevice(id: string, updates: Partial<DeviceRecord>): DeviceRecord | null {
    const idx = this.db.devices.findIndex(d => d.id === id);
    if (idx === -1) return null;
    this.db.devices[idx] = { ...this.db.devices[idx], ...updates };
    this.saveDatabase();
    return this.db.devices[idx];
  }

  public registerDevice(device: DeviceRecord): void {
    const existing = this.db.devices.findIndex(d => d.id === device.id);
    if (existing >= 0) {
      this.db.devices[existing] = device;
    } else {
      this.db.devices.push(device);
    }
    this.saveDatabase();
  }

  // Alerts
  public getAlerts(farmId?: string): RiskAlertRecord[] {
    if (farmId) {
      return this.db.alerts.filter(a => a.farmId === farmId);
    }
    return this.db.alerts;
  }

  public addAlert(alert: RiskAlertRecord): void {
    // Avoid duplicate title within 2 hours
    const duplicate = this.db.alerts.find(
      a => a.farmId === alert.farmId && a.titleEn === alert.titleEn && Date.now() - new Date(a.timestamp).getTime() < 2 * 60 * 60 * 1000
    );
    if (!duplicate) {
      this.db.alerts.unshift(alert);
      if (this.db.alerts.length > 100) this.db.alerts = this.db.alerts.slice(0, 80);
      this.saveDatabase();
    }
  }

  public markAlertAsRead(alertId: string): void {
    const alert = this.db.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.isRead = true;
      this.saveDatabase();
    }
  }

  public dismissAlert(alertId: string): void {
    this.db.alerts = this.db.alerts.filter(a => a.id !== alertId);
    this.saveDatabase();
  }

  // Simulation State
  public getSimulationState() {
    return this.db.simulationState;
  }

  public setSimulationState(state: Partial<DatabaseSchema['simulationState']>) {
    this.db.simulationState = { ...this.db.simulationState, ...state };
    this.saveDatabase();
  }

  // Audit Logs
  public addAuditLog(actor: string, action: string, details: string): void {
    this.db.auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
    });
    if (this.db.auditLogs.length > 100) {
      this.db.auditLogs = this.db.auditLogs.slice(0, 100);
    }
    this.saveDatabase();
  }
}

export const storage = StorageService.getInstance();
