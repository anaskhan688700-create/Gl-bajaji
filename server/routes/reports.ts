import { Router } from 'express';
import { storage } from '../services/storage';

const router = Router();

// Get summary report data
router.get('/summary/:farmId', (req, res) => {
  const farmId = req.params.farmId;
  const farm = storage.getFarmById(farmId) || storage.getFarms()[0];
  const telemetry = storage.getTelemetryHistory(farm ? farm.id : 'farm-01', 100);
  const alerts = storage.getAlerts(farm ? farm.id : 'farm-01');

  // Compute telemetry averages
  let sumMoisture = 0;
  let sumTemp = 0;
  let sumHumidity = 0;
  let sumPh = 0;
  const validCount = telemetry.length || 1;

  for (const t of telemetry) {
    sumMoisture += t.soilMoisture;
    sumTemp += t.soilTemperature;
    sumHumidity += t.relativeHumidity;
    sumPh += t.soilPh;
  }

  res.json({
    success: true,
    farm,
    stats: {
      totalReadings: telemetry.length,
      avgMoisture: Math.round((sumMoisture / validCount) * 10) / 10,
      avgSoilTemp: Math.round((sumTemp / validCount) * 10) / 10,
      avgHumidity: Math.round((sumHumidity / validCount) * 10) / 10,
      avgPh: Math.round((sumPh / validCount) * 100) / 100,
      totalAlertsGenerated: alerts.length,
      activeAlertsCount: alerts.filter(a => a.active).length,
    },
    recentReadings: telemetry.slice(-20),
    alerts: alerts.slice(0, 20),
  });
});

// CSV Export Download
router.get('/export/:farmId', (req, res) => {
  const farmId = req.params.farmId;
  const farm = storage.getFarmById(farmId);
  const telemetry = storage.getTelemetryHistory(farmId, 200);

  // Generate CSV rows
  const headers = [
    'Timestamp (UTC)',
    'Farm ID',
    'Farm Name',
    'Device ID',
    'Soil Moisture (%)',
    'Soil Temp (C)',
    'Ambient Temp (C)',
    'Relative Humidity (%)',
    'Soil pH',
    'Nitrogen (mg/kg)',
    'Phosphorus (mg/kg)',
    'Potassium (mg/kg)',
    'Leaf Wetness (%)',
    'Rainfall (mm)',
    'Battery Voltage (V)',
    'Data Origin (Simulated vs Live)',
    'Data Quality',
  ];

  const rows = telemetry.map(t => [
    t.timestamp,
    t.farmId,
    farm ? `"${farm.name}"` : 'Unknown',
    t.deviceId,
    t.soilMoisture,
    t.soilTemperature,
    t.ambientTemperature,
    t.relativeHumidity,
    t.soilPh,
    t.nitrogen ?? '',
    t.phosphorus ?? '',
    t.potassium ?? '',
    t.leafWetness ?? '',
    t.rainfallMm ?? 0,
    t.batteryVoltage ?? '',
    t.isSimulated ? 'SIMULATED_DEMO_DATA' : 'VERIFIED_HARDWARE',
    t.dataQuality,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="kisanrakshak-telemetry-${farmId}-${Date.now()}.csv"`);
  res.send(csvContent);
});

export default router;

