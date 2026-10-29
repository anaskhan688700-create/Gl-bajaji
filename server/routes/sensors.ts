import { Router } from 'express';
import { storage, SensorTelemetry } from '../services/storage';
import { simulationService, DemoScenario } from '../services/simulationService';
import { CropRulesEngine } from '../services/rulesEngine';

const router = Router();

// Latest telemetry for farm
router.get('/latest/:farmId', (req, res) => {
  const telemetry = storage.getLatestTelemetry(req.params.farmId);
  const simulationState = storage.getSimulationState();
  if (!telemetry) {
    return res.status(404).json({
      success: false,
      message: 'No sensor telemetry found for this farm.',
      simulationState,
    });
  }
  res.json({ success: true, telemetry, simulationState });
});

// Telemetry history for charts (Recharts)
router.get('/history/:farmId', (req, res) => {
  const limit = Math.min(200, Number(req.query.limit) || 48);
  const telemetry = storage.getTelemetryHistory(req.params.farmId, limit);
  const simulationState = storage.getSimulationState();
  res.json({
    success: true,
    count: telemetry.length,
    telemetry,
    simulationState,
  });
});

// LIVE HARDWARE INGESTION ENDPOINT
// Accepts real ESP32 / Arduino JSON payloads
router.post('/ingest', (req, res) => {
  const authHeader = req.headers['authorization'];
  const deviceToken = req.headers['x-device-token'] as string;
  const token = (authHeader ? authHeader.replace(/^Bearer\s+/i, '') : deviceToken) || '';

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Missing device authentication token. Provide X-Device-Token header or Bearer Authorization.',
    });
  }

  const device = storage.getDeviceByToken(token);
  if (!device) {
    return res.status(401).json({
      success: false,
      error: 'INVALID_TOKEN',
      message: 'The provided device token does not match any registered hardware node.',
    });
  }

  const {
    deviceId,
    farmId,
    timestamp,
    soilMoisture,
    soilTemperature,
    ambientTemperature,
    relativeHumidity,
    soilPh,
    nitrogen,
    phosphorus,
    potassium,
    leafWetness,
    lightIntensityLux,
    rainfallMm,
    batteryVoltage,
  } = req.body;

  // Validate device ID matches registered device
  if (deviceId && deviceId !== device.id) {
    storage.updateDevice(device.id, {
      invalidPayloadCount: (device.invalidPayloadCount || 0) + 1,
    });
    return res.status(400).json({
      success: false,
      error: 'DEVICE_ID_MISMATCH',
      message: `Token belongs to device ${device.id}, but payload specified ${deviceId}.`,
    });
  }

  // Validate numeric ranges according to physical sensor limits
  const errors: string[] = [];

  if (typeof soilMoisture !== 'number' || isNaN(soilMoisture) || soilMoisture < 0 || soilMoisture > 100) {
    errors.push(`Invalid soilMoisture (${soilMoisture}). Must be a number between 0% and 100%.`);
  }
  if (typeof soilTemperature !== 'number' || isNaN(soilTemperature) || soilTemperature < -10 || soilTemperature > 65) {
    errors.push(`Invalid soilTemperature (${soilTemperature}). Must be between -10°C and 65°C.`);
  }
  if (typeof ambientTemperature !== 'number' || isNaN(ambientTemperature) || ambientTemperature < -20 || ambientTemperature > 65) {
    errors.push(`Invalid ambientTemperature (${ambientTemperature}). Must be between -20°C and 65°C.`);
  }
  if (typeof relativeHumidity !== 'number' || isNaN(relativeHumidity) || relativeHumidity < 0 || relativeHumidity > 100) {
    errors.push(`Invalid relativeHumidity (${relativeHumidity}). Must be between 0% and 100%.`);
  }
  if (soilPh !== undefined && (typeof soilPh !== 'number' || isNaN(soilPh) || soilPh < 2.0 || soilPh > 12.0)) {
    errors.push(`Invalid soilPh (${soilPh}). Must be between 2.0 and 12.0.`);
  }
  if (batteryVoltage !== undefined && (typeof batteryVoltage !== 'number' || isNaN(batteryVoltage) || batteryVoltage < 2.0 || batteryVoltage > 6.0)) {
    errors.push(`Invalid batteryVoltage (${batteryVoltage}). Expected 3.0V - 4.5V for Li-ion.`);
  }

  if (errors.length > 0) {
    storage.updateDevice(device.id, {
      invalidPayloadCount: (device.invalidPayloadCount || 0) + 1,
    });
    return res.status(400).json({
      success: false,
      error: 'PAYLOAD_VALIDATION_FAILED',
      reasons: errors,
    });
  }

  const assignedFarmId = farmId || device.farmId || 'farm-01';
  const readingTime = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();

  // Create valid real telemetry entry
  const telemetryRecord: SensorTelemetry = {
    id: `tel-hw-${device.id}-${Date.now()}`,
    deviceId: device.id,
    farmId: assignedFarmId,
    timestamp: readingTime,
    soilMoisture: Number(soilMoisture.toFixed(1)),
    soilTemperature: Number(soilTemperature.toFixed(1)),
    ambientTemperature: Number(ambientTemperature.toFixed(1)),
    relativeHumidity: Number(relativeHumidity.toFixed(1)),
    soilPh: soilPh !== undefined ? Number(soilPh.toFixed(2)) : 6.8,
    nitrogen: nitrogen !== undefined ? Number(nitrogen) : undefined,
    phosphorus: phosphorus !== undefined ? Number(phosphorus) : undefined,
    potassium: potassium !== undefined ? Number(potassium) : undefined,
    leafWetness: leafWetness !== undefined ? Number(leafWetness) : undefined,
    lightIntensityLux: lightIntensityLux !== undefined ? Number(lightIntensityLux) : undefined,
    rainfallMm: rainfallMm !== undefined ? Number(rainfallMm) : 0,
    batteryVoltage: batteryVoltage !== undefined ? Number(batteryVoltage.toFixed(2)) : undefined,
    isSimulated: false, // VERIFIED LIVE HARDWARE
    dataQuality: 'High',
  };

  storage.addTelemetry(telemetryRecord);

  // Update device status
  const calcBatteryPct = batteryVoltage ? Math.min(100, Math.max(0, Math.round(((batteryVoltage - 3.3) / (4.2 - 3.3)) * 100))) : device.batteryPercentage;
  storage.updateDevice(device.id, {
    status: 'ONLINE',
    lastSeen: readingTime,
    batteryPercentage: calcBatteryPct,
  });

  // Evaluate risk rules immediately for this farm
  const farm = storage.getFarmById(assignedFarmId);
  if (farm) {
    const evalResult = CropRulesEngine.evaluate(farm.currentCropId, farm.growthStage, telemetryRecord, farm.id);
    for (const alert of evalResult.alerts) {
      storage.addAlert(alert);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Sensor readings ingested and verified successfully.',
    isSimulated: false,
    readingId: telemetryRecord.id,
    timestamp: readingTime,
  });
});

// SIMULATION CONTROLS
router.get('/simulation/state', (req, res) => {
  res.json({
    success: true,
    simulationState: storage.getSimulationState(),
  });
});

router.post('/simulation/toggle', (req, res) => {
  const { isRunning } = req.body;
  const current = storage.getSimulationState().isRunning;
  const target = isRunning !== undefined ? Boolean(isRunning) : !current;
  simulationService.setRunning(target);
  res.json({
    success: true,
    isRunning: target,
    message: `Simulation ${target ? 'started' : 'paused'}.`,
  });
});

router.post('/simulation/scenario', (req, res) => {
  const { scenario } = req.body as { scenario: DemoScenario };
  const validScenarios = ['SCENARIO_A', 'SCENARIO_B', 'SCENARIO_C', 'SCENARIO_D', 'SCENARIO_E', 'NORMAL'];
  if (!validScenarios.includes(scenario)) {
    return res.status(400).json({
      success: false,
      message: `Invalid scenario. Choose from: ${validScenarios.join(', ')}`,
    });
  }

  simulationService.setScenario(scenario);
  res.json({
    success: true,
    activeScenario: scenario,
    message: `Switched simulation scenario to ${scenario}`,
  });
});

export default router;

