import { CROPS_DATABASE, CropData } from '../data/cropsData';

export interface SuitabilityQuery {
  state: string;
  district: string;
  soilType: string;
  soilPh?: number;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  irrigationAvailability: 'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Tube Well' | 'Rainfed';
  areaAcres: number;
  previousCropId?: string;
  budgetPerAcre?: number;
  preferredCategory?: string;
}

export interface CandidateCropResult {
  cropId: string;
  nameEn: string;
  nameHi: string;
  category: string;
  season: string;
  suitabilityScore: number; // 0 - 100%
  suitabilityTier: 'Highly Recommended' | 'Recommended' | 'Moderately Suitable' | 'Low Suitability';
  scoreBreakdown: {
    soilScore: number; // max 25
    seasonScore: number; // max 25
    waterScore: number; // max 20
    rotationScore: number; // max 15
    budgetScore: number; // max 15
  };
  explanationEn: string;
  explanationHi: string;
  waterCategory: string;
  durationRangeDays: string;
  economics: {
    costPerAcre: number;
    totalCostForArea: number;
    expectedYieldPerAcreQuintal: { min: number; max: number; avg: number };
    totalExpectedYieldQuintal: number;
    typicalPricePerQuintal: number;
    grossRevenuePerAcre: number;
    totalGrossRevenue: number;
    estimatedNetReturnPerAcre: number;
    totalEstimatedNetReturn: number;
    breakEvenPricePerQuintal: number;
  };
  keyRisksEn: string[];
  keyRisksHi: string[];
  missingDataCaveats: string[];
  dataSource: string;
}

export class CropSuitabilityEngine {
  public static recommendCrops(query: SuitabilityQuery): CandidateCropResult[] {
    const results: CandidateCropResult[] = [];
    const area = Math.max(0.1, query.areaAcres || 1.0);

    for (const crop of CROPS_DATABASE) {
      let soilScore = 0;
      let seasonScore = 0;
      let waterScore = 0;
      let rotationScore = 0;
      let budgetScore = 0;
      const caveats: string[] = [];

      // 1. Season Fit (max 25)
      if (crop.season === 'Whole Year' || crop.season === query.season) {
        seasonScore = 25;
      } else {
        // Crop not normally grown in this season
        seasonScore = 5;
        caveats.push(`Not the standard optimal growing season (${crop.season} crop vs requested ${query.season})`);
      }

      // 2. Soil Fit (max 25)
      const normalizedQuerySoil = query.soilType.toLowerCase();
      const matchSoil = crop.suitableSoils.some(s => s.toLowerCase().includes(normalizedQuerySoil) || normalizedQuerySoil.includes(s.toLowerCase()));
      if (matchSoil) {
        soilScore = 25;
      } else {
        soilScore = 12; // sub-optimal but can be managed with amendments
        caveats.push(`Sub-optimal soil texture (${query.soilType}); optimal soils are: ${crop.suitableSoils.join(', ')}`);
      }

      // Soil pH adjustment if provided
      if (query.soilPh !== undefined && query.soilPh > 0) {
        if (query.soilPh >= crop.optimalPh.min && query.soilPh <= crop.optimalPh.max) {
          // perfect
        } else {
          soilScore = Math.max(4, soilScore - 8);
          caveats.push(`Soil pH (${query.soilPh}) is outside ideal range (${crop.optimalPh.min}-${crop.optimalPh.max})`);
        }
      } else {
        caveats.push('Soil pH was not provided; recommendation assumes neutral soil conditions (6.5 - 7.5).');
      }

      // 3. Water & Irrigation Fit (max 20)
      if (query.irrigationAvailability === 'Rainfed') {
        if (crop.waterNeedCategory === 'Low') waterScore = 20;
        else if (crop.waterNeedCategory === 'Moderate') {
          waterScore = 10;
          caveats.push('Requires moderate water; rainfed cultivation incurs significant drought vulnerability.');
        } else {
          waterScore = 4;
          caveats.push('Heavy water consumer; not recommended for purely rainfed conditions.');
        }
      } else if (query.irrigationAvailability === 'Drip') {
        waterScore = 20; // Drip handles all with high efficiency
      } else if (query.irrigationAvailability === 'Canal / Flood' || query.irrigationAvailability === 'Tube Well') {
        if (crop.waterNeedCategory === 'Very High' || crop.waterNeedCategory === 'High') waterScore = 19;
        else waterScore = 17;
      } else {
        waterScore = 15;
      }

      // 4. Crop Rotation Synergy (max 15)
      if (query.previousCropId) {
        if (query.previousCropId === crop.id) {
          rotationScore = 4; // Monoculture penalty
          caveats.push(`Monoculture penalty: Growing ${crop.nameEn} continuously increases pest persistence and specific nutrient depletion.`);
        } else {
          // Check if previous crop was legume or cereal
          const prevCrop = CROPS_DATABASE.find(c => c.id === query.previousCropId);
          if (prevCrop?.category === 'Pulse' && crop.category !== 'Pulse') {
            rotationScore = 15; // Legume preceding cereal bonus
          } else if (prevCrop?.category === 'Cereal' && crop.category === 'Pulse') {
            rotationScore = 15;
          } else {
            rotationScore = 11;
          }
        }
      } else {
        rotationScore = 10;
        caveats.push('Previous crop history was not specified; rotation benefits could not be fully weighted.');
      }

      // 5. Budget Fit (max 15)
      const costPerAcre = crop.economics.avgCostPerAcre;
      if (query.budgetPerAcre && query.budgetPerAcre > 0) {
        if (query.budgetPerAcre >= costPerAcre) {
          budgetScore = 15;
        } else {
          const ratio = query.budgetPerAcre / costPerAcre;
          budgetScore = Math.round(Math.max(2, ratio * 15));
          caveats.push(`Estimated cultivation cost (₹${costPerAcre.toLocaleString('en-IN')}/acre) exceeds your entered budget (₹${query.budgetPerAcre.toLocaleString('en-IN')}/acre).`);
        }
      } else {
        budgetScore = 12;
      }

      // Preference filter boost
      if (query.preferredCategory && query.preferredCategory !== 'All' && crop.category === query.preferredCategory) {
        soilScore = Math.min(25, soilScore + 2);
      }

      const totalScore = Math.min(100, soilScore + seasonScore + waterScore + rotationScore + budgetScore);

      let suitabilityTier: CandidateCropResult['suitabilityTier'] = 'Moderately Suitable';
      if (totalScore >= 80) suitabilityTier = 'Highly Recommended';
      else if (totalScore >= 65) suitabilityTier = 'Recommended';
      else if (totalScore >= 50) suitabilityTier = 'Moderately Suitable';
      else suitabilityTier = 'Low Suitability';

      // Economics Calculations
      const avgYield = crop.economics.yieldPerAcreQuintal.avg;
      const price = crop.economics.typicalPricePerQuintal;
      const grossRevPerAcre = avgYield * price;
      const netPerAcre = grossRevPerAcre - costPerAcre;
      const breakEvenPrice = Math.round(costPerAcre / Math.max(1, avgYield));

      const explanationEn = `${crop.nameEn} scores ${totalScore}/100 based on ${query.season} season compatibility, ${query.soilType} soil adaptation, and ${query.irrigationAvailability} irrigation setup.`;
      const explanationHi = `${crop.nameHi} को ${query.season} मौसम की अनुकूलता, ${query.soilType} मिट्टी और ${query.irrigationAvailability} सिंचाई व्यवस्था के आधार पर 100 में से ${totalScore} अंक प्राप्त हुए हैं।`;

      const keyRisksEn = crop.diseaseTriggers.map(d => `${d.diseaseNameEn} (${d.condition})`);
      const keyRisksHi = crop.diseaseTriggers.map(d => `${d.diseaseNameHi} (${d.condition})`);

      results.push({
        cropId: crop.id,
        nameEn: crop.nameEn,
        nameHi: crop.nameHi,
        category: crop.category,
        season: crop.season,
        suitabilityScore: totalScore,
        suitabilityTier,
        scoreBreakdown: {
          soilScore,
          seasonScore,
          waterScore,
          rotationScore,
          budgetScore,
        },
        explanationEn,
        explanationHi,
        waterCategory: crop.waterNeedCategory,
        durationRangeDays: `${crop.durationDays.min} - ${crop.durationDays.max} days`,
        economics: {
          costPerAcre,
          totalCostForArea: Math.round(costPerAcre * area),
          expectedYieldPerAcreQuintal: crop.economics.yieldPerAcreQuintal,
          totalExpectedYieldQuintal: Math.round(avgYield * area * 10) / 10,
          typicalPricePerQuintal: price,
          grossRevenuePerAcre: grossRevPerAcre,
          totalGrossRevenue: Math.round(grossRevPerAcre * area),
          estimatedNetReturnPerAcre: netPerAcre,
          totalEstimatedNetReturn: Math.round(netPerAcre * area),
          breakEvenPricePerQuintal: breakEvenPrice,
        },
        keyRisksEn,
        keyRisksHi,
        missingDataCaveats: caveats,
        dataSource: crop.icardatasetCitation,
      });
    }

    // Sort by suitability score descending
    return results.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }
}

