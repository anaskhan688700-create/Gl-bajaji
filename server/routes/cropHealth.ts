import { Router } from 'express';
import { storage } from '../services/storage';
import { CropRulesEngine } from '../services/rulesEngine';
import { CROPS_DATABASE } from '../data/cropsData';

const router = Router();

// Evaluate and get crop health for a farm
router.get('/:farmId', (req, res) => {
  const farmId = req.params.farmId;
  const farm = storage.getFarmById(farmId);
  if (!farm) {
    return res.status(404).json({ success: false, message: 'Farm not found.' });
  }

  const telemetry = storage.getLatestTelemetry(farmId);
  const evaluation = CropRulesEngine.evaluate(farm.currentCropId, farm.growthStage, telemetry, farm.id);
  const allAlerts = storage.getAlerts(farmId);
  const crop = CROPS_DATABASE.find(c => c.id === farm.currentCropId) || CROPS_DATABASE[0];

  res.json({
    success: true,
    farmId: farm.id,
    farmName: farm.name,
    crop,
    evaluation,
    recentAlerts: allAlerts.slice(0, 15),
    isTelemetrySimulated: telemetry ? telemetry.isSimulated : true,
    lastUpdated: telemetry ? telemetry.timestamp : null,
  });
});

// Mark alert as read
router.post('/alerts/:alertId/read', (req, res) => {
  storage.markAlertAsRead(req.params.alertId);
  res.json({ success: true, message: 'Alert marked as read.' });
});

// Dismiss alert
router.delete('/alerts/:alertId', (req, res) => {
  storage.dismissAlert(req.params.alertId);
  res.json({ success: true, message: 'Alert dismissed.' });
});

export default router;

