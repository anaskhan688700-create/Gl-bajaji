import { Router } from 'express';
import { CROPS_DATABASE, CropData } from '../data/cropsData';

const router = Router();

interface CompareItem {
  cropId: string;
  customPricePerQuintal?: number;
  customYieldMultiplier?: number; // e.g. 1.0 (normal), 0.8 (drought/pest), 1.2 (optimal conditions)
}

router.post('/compare', (req, res) => {
  const { cropIds, items, areaAcres, soilType, season } = req.body;

  const targetIds: string[] = cropIds || (items ? items.map((i: any) => i.cropId) : ['wheat', 'mustard', 'chickpea']);
  const area = Math.max(0.1, Number(areaAcres) || 1.0);

  const comparedCrops = targetIds
    .map(id => CROPS_DATABASE.find(c => c.id === id))
    .filter((c): c is CropData => Boolean(c))
    .map(crop => {
      const customItem = items ? items.find((i: any) => i.cropId === crop.id) : undefined;
      const yieldMultiplier = customItem?.customYieldMultiplier ?? 1.0;
      const adjustedAvgYield = Math.round(crop.economics.yieldPerAcreQuintal.avg * yieldMultiplier * 10) / 10;
      const pricePerQtl = customItem?.customPricePerQuintal ?? crop.economics.typicalPricePerQuintal;

      const costPerAcre = crop.economics.avgCostPerAcre;
      const totalCost = Math.round(costPerAcre * area);
      const grossRevPerAcre = Math.round(adjustedAvgYield * pricePerQtl);
      const totalGrossRev = Math.round(grossRevPerAcre * area);
      const netReturnPerAcre = grossRevPerAcre - costPerAcre;
      const totalNetReturn = totalGrossRev - totalCost;
      const breakEvenPrice = Math.round(costPerAcre / Math.max(0.1, adjustedAvgYield));

      return {
        id: crop.id,
        nameEn: crop.nameEn,
        nameHi: crop.nameHi,
        category: crop.category,
        season: crop.season,
        waterNeedCategory: crop.waterNeedCategory,
        waterNeedMm: crop.waterNeedMm,
        durationDays: crop.durationDays,
        costPerAcre,
        totalCost,
        breakdownCosts: crop.economics.breakdownCostPerAcre,
        yieldRangeQuintal: {
          min: Math.round(crop.economics.yieldPerAcreQuintal.min * yieldMultiplier * 10) / 10,
          max: Math.round(crop.economics.yieldPerAcreQuintal.max * yieldMultiplier * 10) / 10,
          avg: adjustedAvgYield,
        },
        typicalPricePerQuintal: pricePerQtl,
        grossRevenuePerAcre: grossRevPerAcre,
        totalGrossRevenue: totalGrossRev,
        estimatedNetReturnPerAcre: netReturnPerAcre,
        totalEstimatedNetReturn: totalNetReturn,
        breakEvenPricePerQuintal: breakEvenPrice,
        returnOnInvestmentPct: Math.round((netReturnPerAcre / Math.max(1, costPerAcre)) * 100),
        diseaseRisks: crop.diseaseTriggers.map(d => ({ nameEn: d.diseaseNameEn, nameHi: d.diseaseNameHi })),
        rotationBenefits: crop.rotationBenefits,
        citation: crop.icardatasetCitation,
      };
    });

  // Calculate trade-off insights
  let highestNetReturnCrop = comparedCrops[0];
  let lowestWaterCrop = comparedCrops[0];
  let lowestCostCrop = comparedCrops[0];

  for (const c of comparedCrops) {
    if (c.estimatedNetReturnPerAcre > (highestNetReturnCrop?.estimatedNetReturnPerAcre ?? -Infinity)) {
      highestNetReturnCrop = c;
    }
    if (c.waterNeedMm.min < (lowestWaterCrop?.waterNeedMm.min ?? Infinity)) {
      lowestWaterCrop = c;
    }
    if (c.costPerAcre < (lowestCostCrop?.costPerAcre ?? Infinity)) {
      lowestCostCrop = c;
    }
  }

  const tradeOffSummary = {
    highestNetReturn: highestNetReturnCrop
      ? `${highestNetReturnCrop.nameEn} offers highest estimated net return (₹${highestNetReturnCrop.estimatedNetReturnPerAcre.toLocaleString('en-IN')}/acre), but require careful risk review.`
      : '',
    lowestWaterRisk: lowestWaterCrop
      ? `${lowestWaterCrop.nameEn} requires minimum irrigation (${lowestWaterCrop.waterNeedMm.min}-${lowestWaterCrop.waterNeedMm.max} mm), ideal if tube well yield is constrained.`
      : '',
    lowestCapitalCost: lowestCostCrop
      ? `${lowestCostCrop.nameEn} has the lowest capital cost (₹${lowestCostCrop.costPerAcre.toLocaleString('en-IN')}/acre), minimizing initial financial risk.`
      : '',
  };

  res.json({
    success: true,
    areaAcres: area,
    comparedCrops,
    tradeOffSummary,
  });
});

export default router;

