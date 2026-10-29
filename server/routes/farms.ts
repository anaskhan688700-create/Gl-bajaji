import { Router } from 'express';
import { storage, FarmRecord } from '../services/storage';
import { CROPS_DATABASE } from '../data/cropsData';

const router = Router();

// List all farms for user
router.get('/', (req, res) => {
  const userId = (req.headers['x-user-id'] as string) || 'usr-farmer-01';
  const farms = storage.getFarms();
  // In demo mode or if user has farms, return matching
  const userFarms = farms.filter(f => f.userId === userId || f.userId === 'usr-farmer-01');
  res.json({ success: true, farms: userFarms.length > 0 ? userFarms : farms });
});

// Get single farm details
router.get('/:id', (req, res) => {
  const farm = storage.getFarmById(req.params.id);
  if (!farm) {
    return res.status(404).json({ success: false, message: 'Farm not found.' });
  }

  const crop = CROPS_DATABASE.find(c => c.id === farm.currentCropId) || CROPS_DATABASE[0];
  const telemetry = storage.getLatestTelemetry(farm.id);
  const device = farm.assignedDeviceId ? storage.getDeviceById(farm.assignedDeviceId) : undefined;
  const alerts = storage.getAlerts(farm.id);

  res.json({
    success: true,
    farm,
    cropDetails: crop,
    latestTelemetry: telemetry,
    device,
    activeAlerts: alerts.filter(a => a.active),
  });
});

// Create farm
router.post('/', (req, res) => {
  const {
    name,
    state,
    district,
    villageOrBlock,
    area,
    areaUnit,
    soilType,
    irrigationMethod,
    currentCropId,
    cropVariety,
    sowingDate,
    expectedHarvestDate,
    growthStage,
    assignedDeviceId,
    notes,
  } = req.body;

  if (!name || !state || !district || !area || !currentCropId) {
    return res.status(400).json({
      success: false,
      message: 'Name, state, district, area, and crop type are required fields.',
    });
  }

  const userId = (req.headers['x-user-id'] as string) || 'usr-farmer-01';
  const newFarmId = `farm-${Date.now().toString().slice(-5)}`;

  const newFarm: FarmRecord = {
    id: newFarmId,
    userId,
    name,
    location: {
      state,
      district,
      villageOrBlock: villageOrBlock || '',
    },
    area: Number(area) || 1.0,
    areaUnit: areaUnit || 'Acre',
    soilType: soilType || 'Alluvial',
    irrigationMethod: irrigationMethod || 'Tube Well',
    currentCropId,
    cropVariety: cropVariety || 'Standard Cultivar',
    sowingDate: sowingDate || new Date().toISOString().split('T')[0],
    expectedHarvestDate: expectedHarvestDate || new Date(Date.now() + 110 * 86400000).toISOString().split('T')[0],
    growthStage: growthStage || 'Vegetative Growth',
    assignedDeviceId: assignedDeviceId || `ESP32-KR-${Math.floor(100 + Math.random() * 900)}`,
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storage.addFarm(newFarm);
  storage.addAuditLog(userId, 'FARM_CREATE', `Created farm: ${newFarm.name} (${newFarm.id})`);

  res.status(201).json({
    success: true,
    farm: newFarm,
    message: 'Farm created successfully.',
  });
});

// Update farm
router.put('/:id', (req, res) => {
  const farmId = req.params.id;
  const existing = storage.getFarmById(farmId);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Farm not found.' });
  }

  const updated = storage.updateFarm(farmId, req.body);
  storage.addAuditLog('User', 'FARM_UPDATE', `Updated farm details for: ${farmId}`);

  res.json({
    success: true,
    farm: updated,
    message: 'Farm updated successfully.',
  });
});

// Delete farm
router.delete('/:id', (req, res) => {
  const farmId = req.params.id;
  const deleted = storage.deleteFarm(farmId);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Farm not found or already deleted.' });
  }

  storage.addAuditLog('User', 'FARM_DELETE', `Deleted farm: ${farmId}`);
  res.json({
    success: true,
    message: 'Farm deleted successfully.',
  });
});

export default router;

