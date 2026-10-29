import { Router } from 'express';
import { CropSuitabilityEngine, SuitabilityQuery } from '../services/suitabilityEngine';
import { CROPS_DATABASE } from '../data/cropsData';
import { storage } from '../services/storage';

const router = Router();

// Get list of all known crops
router.get('/crops', (req, res) => {
  res.json({
    success: true,
    total: CROPS_DATABASE.length,
    crops: CROPS_DATABASE,
  });
});

// Calculate crop recommendations
router.post('/recommend', (req, res) => {
  const {
    farmId,
    state,
    district,
    soilType,
    soilPh,
    season,
    irrigationAvailability,
    areaAcres,
    previousCropId,
    budgetPerAcre,
    preferredCategory,
  } = req.body;

  // If farmId provided, prefill from farm record
  let queryState = state;
  let queryDistrict = district;
  let querySoil = soilType;
  let queryIrrigation = irrigationAvailability;
  let queryArea = Number(areaAcres) || 1.0;

  if (farmId) {
    const farm = storage.getFarmById(farmId);
    if (farm) {
      if (!queryState) queryState = farm.location.state;
      if (!queryDistrict) queryDistrict = farm.location.district;
      if (!querySoil) querySoil = farm.soilType;
      if (!queryIrrigation) queryIrrigation = farm.irrigationMethod;
      if (!queryArea) queryArea = farm.area;
    }
  }

  const query: SuitabilityQuery = {
    state: queryState || 'Haryana',
    district: queryDistrict || 'Karnal',
    soilType: querySoil || 'Loam',
    soilPh: soilPh !== undefined ? Number(soilPh) : undefined,
    season: (season as any) || 'Rabi',
    irrigationAvailability: (queryIrrigation as any) || 'Tube Well',
    areaAcres: queryArea,
    previousCropId,
    budgetPerAcre: budgetPerAcre ? Number(budgetPerAcre) : undefined,
    preferredCategory,
  };

  const recommendations = CropSuitabilityEngine.recommendCrops(query);

  res.json({
    success: true,
    query,
    count: recommendations.length,
    recommendations,
  });
});

export default router;

