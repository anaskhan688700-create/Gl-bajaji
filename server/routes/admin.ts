import { Router } from 'express';
import { storage } from '../services/storage';
import { CROPS_DATABASE } from '../data/cropsData';

const router = Router();

// Platform Overview Stats
router.get('/stats', (req, res) => {
  const users = storage.getUsers();
  const farms = storage.getFarms();
  const devices = storage.getDevices();
  const telemetry = storage.getData().telemetry;
  const alerts = storage.getAlerts();
  const auditLogs = storage.getData().auditLogs;

  const onlineDevices = devices.filter(d => d.status === 'ONLINE').length;
  const totalInvalidPackets = devices.reduce((sum, d) => sum + (d.invalidPayloadCount || 0), 0);
  const activeAlerts = alerts.filter(a => a.active);

  res.json({
    success: true,
    stats: {
      totalUsers: users.length,
      totalFarms: farms.length,
      totalDevices: devices.length,
      onlineDevices,
      offlineDevices: devices.length - onlineDevices,
      totalTelemetryReadings: telemetry.length,
      activeAlertsCount: activeAlerts.length,
      totalInvalidPackets,
      simulationState: storage.getSimulationState(),
    },
    devices,
    recentAlerts: alerts.slice(0, 10),
    recentAuditLogs: auditLogs.slice(0, 15),
  });
});

// Audit logs
router.get('/audit-logs', (req, res) => {
  res.json({
    success: true,
    logs: storage.getData().auditLogs,
  });
});

// Update crop risk threshold
router.post('/thresholds', (req, res) => {
  const { cropId, growthStage, minMoisture, maxMoisture, waterStressAlert } = req.body;
  const crop = CROPS_DATABASE.find(c => c.id === cropId);
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop not found in knowledge base.' });
  }

  if (crop.stageThresholds[growthStage]) {
    if (minMoisture !== undefined) crop.stageThresholds[growthStage].minMoisture = Number(minMoisture);
    if (maxMoisture !== undefined) crop.stageThresholds[growthStage].maxMoisture = Number(maxMoisture);
    if (waterStressAlert !== undefined) crop.stageThresholds[growthStage].waterStressAlert = Number(waterStressAlert);

    storage.addAuditLog('Admin', 'THRESHOLD_UPDATE', `Updated thresholds for ${crop.nameEn} stage "${growthStage}"`);
    return res.json({
      success: true,
      message: `Thresholds updated successfully for ${crop.nameEn} (${growthStage}).`,
      stageThresholds: crop.stageThresholds[growthStage],
    });
  }

  res.status(400).json({ success: false, message: 'Specified growth stage not found for this crop.' });
});

export default router;

