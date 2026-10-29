import { describe, it, expect } from 'vitest';
import { computeFarmEconomics, CostCalculatorPayload } from '../routes/calculator';

describe('Farm Economics & Profit Calculator', () => {
  it('correctly calculates total costs, gross revenue, and net return for 1 Acre of Wheat', () => {
    const payload: CostCalculatorPayload = {
      area: 1.0,
      areaUnit: 'Acre',
      seedCost: 2200,
      fertilizerCost: 3400,
      irrigationCost: 2600,
      laborCost: 3100,
      machineryCost: 2000,
      cropProtectionCost: 1200,
      transportCost: 500,
      storageCost: 0,
      otherExpenses: 0,
      expectedYieldQuintal: 21,
      yieldInputType: 'PER_UNIT',
      expectedSellingPricePerQuintal: 2275, // MSP
      expectedDeductions: 200,
    };

    const result = computeFarmEconomics(payload);

    // Expected production cost = 2200 + 3400 + 2600 + 3100 + 2000 + 1200 + 500 = 15000
    expect(result.costs.totalProductionCost).toBe(15000);
    // Expected Gross Revenue = 21 * 2275 = 47775
    expect(result.yieldAndRevenue.grossRevenue).toBe(47775);
    // Expected Net Return = 47775 - 15000 - 200 = 32575
    expect(result.yieldAndRevenue.estimatedNetReturn).toBe(32575);
    // Break-even price = (15000 + 200) / 21 = ~724
    expect(result.metrics.breakEvenPricePerQuintal).toBe(724);
    expect(result.metrics.isProfitable).toBe(true);
  });

  it('correctly handles Hectare unit conversion (1 ha = ~2.471 acres)', () => {
    const payload: CostCalculatorPayload = {
      area: 2.0, // 2 Hectares = ~4.942 Acres
      areaUnit: 'Hectare',
      seedCost: 10000,
      fertilizerCost: 10000,
      irrigationCost: 5000,
      laborCost: 5000,
      machineryCost: 5000,
      cropProtectionCost: 2000,
      transportCost: 1000,
      storageCost: 0,
      otherExpenses: 0,
      expectedYieldQuintal: 20, // 20 Qtl per Hectare -> 40 Qtl total
      yieldInputType: 'PER_UNIT',
      expectedSellingPricePerQuintal: 2500,
      expectedDeductions: 0,
    };

    const result = computeFarmEconomics(payload);

    expect(result.inputSummary.areaInAcres).toBeCloseTo(4.94, 1);
    expect(result.yieldAndRevenue.totalYieldQuintal).toBe(40);
    expect(result.costs.totalProductionCost).toBe(38000);
    expect(result.yieldAndRevenue.grossRevenue).toBe(100000);
    expect(result.yieldAndRevenue.estimatedNetReturn).toBe(62000);
  });
});

