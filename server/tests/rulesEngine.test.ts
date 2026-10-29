import { describe, it, expect } from 'vitest';
import { CropRulesEngine } from '../services/rulesEngine';
import { SensorTelemetry } from '../services/storage';

describe('Crop Rules & Early-Warning Engine', () => {
  const baseTelemetry: SensorTelemetry = {
    id: 'tel-test-01',
    deviceId: 'ESP32-TEST',
    farmId: 'farm-01',
    timestamp: new Date().toISOString(),
    soilMoisture: 55, // optimal
    soilTemperature: 19,
    ambientTemperature: 21,
    relativeHumidity: 58,
    soilPh: 6.8,
    isSimulated: true,
    dataQuality: 'High',
  };

  it('evaluates healthy conditions as Normal risk', () => {
    const result = CropRulesEngine.evaluate('wheat', 'Flowering / Boot Stage (70-80 DAS)', baseTelemetry, 'farm-01');
    expect(result.overallRisk).toBe('Normal');
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it('triggers High Risk when soil moisture drops below stage water stress threshold', () => {
    const stressTelemetry: SensorTelemetry = {
      ...baseTelemetry,
      soilMoisture: 22, // Wheat flowering alert threshold is < 38%
    };

    const result = CropRulesEngine.evaluate('wheat', 'Flowering / Boot Stage (70-80 DAS)', stressTelemetry, 'farm-01');
    expect(result.overallRisk).toBe('High risk');
    const moistureAlert = result.alerts.find(a => a.severity === 'High risk' && a.titleEn.includes('Moisture'));
    expect(moistureAlert).toBeDefined();
    expect(moistureAlert?.recommendedActionEn).toContain('irrigation');
  });

  it('triggers Environmental Watch when sustained humidity exceeds 80%', () => {
    const fungalTelemetry: SensorTelemetry = {
      ...baseTelemetry,
      relativeHumidity: 88,
      leafWetness: 75,
      ambientTemperature: 20,
    };

    const result = CropRulesEngine.evaluate('wheat', 'Flowering / Boot Stage (70-80 DAS)', fungalTelemetry, 'farm-01');
    expect(result.overallRisk).toBe('Watch');
    const diseaseAlert = result.alerts.find(a => a.titleEn.includes('Environmental Conditions Favorable'));
    expect(diseaseAlert).toBeDefined();
    // Safety check: Alert must clearly clarify it is environmental risk, NOT a confirmed diagnosis
    expect(diseaseAlert?.explanationEn).toContain('NOT a confirmed diagnosis');
  });

  it('handles missing telemetry with Insufficient Data status', () => {
    const result = CropRulesEngine.evaluate('wheat', 'Flowering / Boot Stage (70-80 DAS)', undefined, 'farm-01');
    expect(result.overallRisk).toBe('Insufficient data');
    expect(result.score).toBe(0);
  });
});

