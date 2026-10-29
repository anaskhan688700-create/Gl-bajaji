import { Router } from 'express';

const router = Router();

export interface CostCalculatorPayload {
  area: number;
  areaUnit: 'Acre' | 'Hectare' | 'Bigha';
  seedCost: number;
  fertilizerCost: number;
  irrigationCost: number;
  laborCost: number;
  machineryCost: number;
  cropProtectionCost: number;
  transportCost: number;
  storageCost: number;
  otherExpenses: number;
  expectedYieldQuintal: number; // total or per unit depending on yieldInputType
  yieldInputType: 'PER_UNIT' | 'TOTAL';
  expectedSellingPricePerQuintal: number; // INR
  expectedDeductions: number; // INR (mandi fee, loading, bagging)
}

export function computeFarmEconomics(payload: CostCalculatorPayload) {
  const {
    area,
    areaUnit,
    seedCost,
    fertilizerCost,
    irrigationCost,
    laborCost,
    machineryCost,
    cropProtectionCost,
    transportCost,
    storageCost,
    otherExpenses,
    expectedYieldQuintal,
    yieldInputType,
    expectedSellingPricePerQuintal,
    expectedDeductions,
  } = payload;

  const validArea = Math.max(0.01, Number(area) || 1.0);

  // Conversion factors to Acres
  let areaInAcres = validArea;
  if (areaUnit === 'Hectare') {
    areaInAcres = validArea * 2.47105;
  } else if (areaUnit === 'Bigha') {
    areaInAcres = validArea * 0.625; // standard pukka bigha ~ 0.625 acres
  }

  const totalProductionCost =
    Number(seedCost || 0) +
    Number(fertilizerCost || 0) +
    Number(irrigationCost || 0) +
    Number(laborCost || 0) +
    Number(machineryCost || 0) +
    Number(cropProtectionCost || 0) +
    Number(transportCost || 0) +
    Number(storageCost || 0) +
    Number(otherExpenses || 0);

  const costPerAcre = Math.round(totalProductionCost / areaInAcres);
  const costPerEnteredUnit = Math.round(totalProductionCost / validArea);

  let totalYieldQuintal = Number(expectedYieldQuintal || 0);
  if (yieldInputType === 'PER_UNIT') {
    totalYieldQuintal = (Number(expectedYieldQuintal) || 0) * validArea;
  }

  const yieldPerAcre = Math.round((totalYieldQuintal / areaInAcres) * 10) / 10;
  const pricePerQtl = Number(expectedSellingPricePerQuintal || 0);
  const grossRevenue = Math.round(totalYieldQuintal * pricePerQtl);
  const deductions = Number(expectedDeductions || 0);
  const estimatedNetReturn = grossRevenue - totalProductionCost - deductions;

  const costPerQuintal = totalYieldQuintal > 0 ? Math.round(totalProductionCost / totalYieldQuintal) : 0;
  const breakEvenPricePerQuintal = totalYieldQuintal > 0 ? Math.round((totalProductionCost + deductions) / totalYieldQuintal) : 0;
  const returnOnInvestmentPct = totalProductionCost > 0 ? Math.round((estimatedNetReturn / totalProductionCost) * 100) : 0;

  return {
    inputSummary: {
      enteredArea: validArea,
      enteredUnit: areaUnit,
      areaInAcres: Math.round(areaInAcres * 100) / 100,
      yieldInputType,
    },
    costs: {
      seed: Number(seedCost || 0),
      fertilizer: Number(fertilizerCost || 0),
      irrigation: Number(irrigationCost || 0),
      labor: Number(laborCost || 0),
      machinery: Number(machineryCost || 0),
      cropProtection: Number(cropProtectionCost || 0),
      transport: Number(transportCost || 0),
      storage: Number(storageCost || 0),
      other: Number(otherExpenses || 0),
      totalProductionCost,
      costPerEnteredUnit,
      costPerAcre,
    },
    yieldAndRevenue: {
      totalYieldQuintal: Math.round(totalYieldQuintal * 10) / 10,
      yieldPerAcre,
      expectedSellingPricePerQuintal: pricePerQtl,
      grossRevenue,
      deductions,
      estimatedNetReturn,
      netReturnPerAcre: Math.round(estimatedNetReturn / areaInAcres),
    },
    metrics: {
      costPerQuintal,
      breakEvenPricePerQuintal,
      returnOnInvestmentPct,
      isProfitable: estimatedNetReturn > 0,
    },
  };
}

router.post('/calculate', (req, res) => {
  try {
    const result = computeFarmEconomics(req.body);
    res.json({
      success: true,
      result,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      message: 'Failed to compute economics: ' + (err.message || 'Invalid input'),
    });
  }
});

export default router;

