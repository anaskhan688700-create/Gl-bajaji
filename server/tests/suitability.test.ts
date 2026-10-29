import { describe, it, expect } from 'vitest';
import { CropSuitabilityEngine, SuitabilityQuery } from '../services/suitabilityEngine';

describe('Crop Suitability Engine', () => {
  it('recommends Rabi crops highly for Rabi season in Loam soil with tube well irrigation', () => {
    const query: SuitabilityQuery = {
      state: 'Haryana',
      district: 'Karnal',
      soilType: 'Loam',
      season: 'Rabi',
      irrigationAvailability: 'Tube Well',
      areaAcres: 4.0,
      previousCropId: 'paddy', // Paddy-Wheat rotation
    };

    const results = CropSuitabilityEngine.recommendCrops(query);
    expect(results.length).toBeGreaterThan(0);

    const topCrop = results[0];
    expect(['wheat', 'mustard', 'chickpea']).toContain(topCrop.cropId);
    expect(topCrop.suitabilityScore).toBeGreaterThanOrEqual(70);
  });

  it('penalizes continuous monoculture (same crop consecutive seasons)', () => {
    const queryWithSameCrop: SuitabilityQuery = {
      state: 'Haryana',
      district: 'Karnal',
      soilType: 'Loam',
      season: 'Rabi',
      irrigationAvailability: 'Tube Well',
      areaAcres: 4.0,
      previousCropId: 'wheat', // monoculture
    };

    const results = CropSuitabilityEngine.recommendCrops(queryWithSameCrop);
    const wheatResult = results.find(r => r.cropId === 'wheat');
    expect(wheatResult?.scoreBreakdown.rotationScore).toBeLessThan(10);
    expect(wheatResult?.missingDataCaveats.some(c => c.includes('Monoculture penalty'))).toBe(true);
  });
});

