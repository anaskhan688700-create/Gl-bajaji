export interface User {
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

export interface Farm {
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
  timestamp: string;
  soilMoisture: number;
  soilTemperature: number;
  ambientTemperature: number;
  relativeHumidity: number;
  soilPh: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  leafWetness?: number;
  lightIntensityLux?: number;
  rainfallMm?: number;
  batteryVoltage?: number;
  isSimulated: boolean;
  dataQuality: 'High' | 'Good' | 'Stale' | 'Degraded' | 'Anomalous';
}

export interface RiskAlert {
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
  dataQuality: 'High' | 'Good' | 'Degraded';
  confidenceLevel: 'High' | 'Moderate' | 'Provisional';
  timestamp: string;
  isRead: boolean;
  active: boolean;
}

export interface Device {
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

export type DemoScenario = 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'SCENARIO_D' | 'SCENARIO_E' | 'NORMAL';

