import React, { useState, useEffect } from 'react';
import {
  Calculator,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  PieChart,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const ProfitCalculatorPage: React.FC = () => {
  const { selectedFarm } = useFarms();
  const { language, t } = useLanguage();

  const [area, setArea] = useState<number>(selectedFarm?.area || 4.0);
  const [areaUnit, setAreaUnit] = useState<'Acre' | 'Hectare' | 'Bigha'>(selectedFarm?.areaUnit || 'Acre');
  const [selectedCropPreset, setSelectedCropPreset] = useState<string>(selectedFarm?.currentCropId || 'wheat');

  // Itemized costs
  const [seedCost, setSeedCost] = useState<number>(8800);
  const [fertilizerCost, setFertilizerCost] = useState<number>(13600);
  const [irrigationCost, setIrrigationCost] = useState<number>(10400);
  const [laborCost, setLaborCost] = useState<number>(12400);
  const [machineryCost, setMachineryCost] = useState<number>(8000);
  const [cropProtectionCost, setCropProtectionCost] = useState<number>(4800);
  const [transportCost, setTransportCost] = useState<number>(2000);
  const [storageCost, setStorageCost] = useState<number>(0);
  const [otherExpenses, setOtherExpenses] = useState<number>(0);

  // Yield & Revenue
  const [expectedYield, setExpectedYield] = useState<number>(21); // Quintal per unit
  const [yieldInputType, setYieldInputType] = useState<'PER_UNIT' | 'TOTAL'>('PER_UNIT');
  const [sellingPrice, setSellingPrice] = useState<number>(2275); // ₹ / Qtl
  const [deductions, setDeductions] = useState<number>(800);

  const [calculationResult, setCalculationResult] = useState<any>(null);

  const handleApplyPreset = (cropId: string) => {
    const crop = CROPS_DATABASE.find(c => c.id === cropId);
    if (!crop) return;
    setSelectedCropPreset(cropId);
    const validArea = area || 1.0;
    const bd = crop.economics.breakdownCostPerAcre;

    setSeedCost(Math.round(bd.seed * validArea));
    setFertilizerCost(Math.round(bd.fertilizer * validArea));
    setIrrigationCost(Math.round(bd.irrigation * validArea));
    setLaborCost(Math.round(bd.labor * validArea));
    setMachineryCost(Math.round(bd.machinery * validArea));
    setCropProtectionCost(Math.round(bd.cropProtection * validArea));
    setTransportCost(Math.round(500 * validArea));

    setExpectedYield(crop.economics.yieldPerAcreQuintal.avg);
    setYieldInputType('PER_UNIT');
    setSellingPrice(crop.economics.typicalPricePerQuintal);
  };

  const calculate = async () => {
    try {
      const res = await fetch('/api/v1/calculator/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          expectedYieldQuintal: expectedYield,
          yieldInputType,
          expectedSellingPricePerQuintal: sellingPrice,
          expectedDeductions: deductions,
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setCalculationResult(data.result);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    calculate();
  }, [
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
    expectedYield,
    yieldInputType,
    sellingPrice,
    deductions,
  ]);

  const costs = calculationResult?.costs;
  const rev = calculationResult?.yieldAndRevenue;
  const metrics = calculationResult?.metrics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <Calculator className="w-7 h-7 text-agri" />
            <span>{t.navCalculator}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Itemized production cost calculation, break-even selling price, and estimated net returns
          </p>
        </div>

        {/* Crop Presets Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <span className="text-xs font-bold text-secondaryText whitespace-nowrap">Load Preset:</span>
          {['wheat', 'mustard', 'tomato', 'paddy', 'chickpea'].map(cId => {
            const crop = CROPS_DATABASE.find(c => c.id === cId);
            return (
              <button
                key={cId}
                onClick={() => handleApplyPreset(cId)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCropPreset === cId
                    ? 'bg-forest text-limeAccent shadow-soft'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {crop?.nameEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Inputs vs Calculation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Itemized Inputs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Farm Area & Unit Box */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
            <h3 className="text-xs font-bold text-forest uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              1. Farm Land Scope
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Farm Area
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={area}
                  onChange={e => setArea(Math.max(0.01, parseFloat(e.target.value) || 1))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Measurement Unit
                </label>
                <select
                  value={areaUnit}
                  onChange={e => setAreaUnit(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                >
                  <option value="Acre">Acre (एकड़)</option>
                  <option value="Hectare">Hectare (1 Ha = ~2.47 Acres)</option>
                  <option value="Bigha">Bigha (Standard Pukka Bigha)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Itemized Input Costs */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-xs font-bold text-forest uppercase tracking-wider">
                2. Itemized Production Expenses (₹ INR)
              </h3>
              <span className="text-xs font-extrabold text-agri">
                Subtotal: ₹{costs?.totalProductionCost?.toLocaleString('en-IN') ?? 0}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Seed / Planting Material Cost (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={seedCost}
                  onChange={e => setSeedCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Fertilizers & Soil Nutrients (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={fertilizerCost}
                  onChange={e => setFertilizerCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Irrigation / Electricity / Diesel (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={irrigationCost}
                  onChange={e => setIrrigationCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Labor & Weeding Costs (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={laborCost}
                  onChange={e => setLaborCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Machinery, Tractor Hire & Tillage (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={machineryCost}
                  onChange={e => setMachineryCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Crop Protection Chemicals / Sprays (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={cropProtectionCost}
                  onChange={e => setCropProtectionCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Transport to Mandi & Logistics (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={transportCost}
                  onChange={e => setTransportCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Packaging / Storage / Miscellaneous (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={otherExpenses}
                  onChange={e => setOtherExpenses(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Expected Yield & Selling Price */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft">
            <h3 className="text-xs font-bold text-forest uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
              3. Expected Yield & Market Valuation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Expected Yield (Quintals)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={expectedYield}
                  onChange={e => setExpectedYield(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
                <div className="flex gap-2 mt-1 text-[11px] text-secondaryText">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={yieldInputType === 'PER_UNIT'}
                      onChange={() => setYieldInputType('PER_UNIT')}
                    />
                    Per {areaUnit}
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={yieldInputType === 'TOTAL'}
                      onChange={() => setYieldInputType('TOTAL')}
                    />
                    Total Farm
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Expected Mandi/MSP Price (₹/Qtl)
                </label>
                <input
                  type="number"
                  step="50"
                  value={sellingPrice}
                  onChange={e => setSellingPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-darkText mb-1">
                  Mandi Fee / Deductions (₹)
                </label>
                <input
                  type="number"
                  step="50"
                  value={deductions}
                  onChange={e => setDeductions(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Instant Calculation Summary Card */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-forest to-forest-light text-white rounded-3xl p-6 sm:p-7 shadow-elevated">
            <span className="text-[11px] font-bold uppercase tracking-wider text-limeAccent block mb-1">
              Economic Feasibility Report
            </span>
            <h3 className="text-xl font-extrabold mb-4">
              Estimated Net Return
            </h3>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 mb-6">
              <span className="text-xs text-gray-200 block">Total Projected Profit:</span>
              <span className={`text-3xl sm:text-4xl font-black ${rev?.estimatedNetReturn >= 0 ? 'text-limeAccent' : 'text-rose-300'}`}>
                ₹{rev?.estimatedNetReturn?.toLocaleString('en-IN') ?? 0}
              </span>
              <span className="text-xs text-gray-300 block mt-1">
                (₹{rev?.netReturnPerAcre?.toLocaleString('en-IN') ?? 0} / Acre)
              </span>
            </div>

            {/* Core Calculations Breakdown */}
            <div className="space-y-2.5 text-xs text-gray-200 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between">
                <span>Total Output Yield:</span>
                <strong className="text-white font-bold">{rev?.totalYieldQuintal ?? 0} Quintals</strong>
              </div>

              <div className="flex items-center justify-between">
                <span>Estimated Gross Revenue:</span>
                <strong className="text-white font-bold">₹{rev?.grossRevenue?.toLocaleString('en-IN') ?? 0}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span>Total Production Costs:</span>
                <strong className="text-rose-300 font-bold">-₹{costs?.totalProductionCost?.toLocaleString('en-IN') ?? 0}</strong>
              </div>

              <div className="flex items-center justify-between">
                <span>Deductions & Mandi Cess:</span>
                <strong className="text-rose-300 font-bold">-₹{rev?.deductions?.toLocaleString('en-IN') ?? 0}</strong>
              </div>
            </div>

            {/* Break-Even & ROI Indicators */}
            <div className="grid grid-cols-2 gap-2 mt-6 pt-4 border-t border-white/10 text-xs">
              <div className="bg-forest-dark/70 p-3 rounded-xl">
                <span className="text-[10px] text-gray-300 block">Break-Even Selling Price</span>
                <span className="text-sm font-bold text-limeAccent">
                  ₹{metrics?.breakEvenPricePerQuintal ?? 0} / Qtl
                </span>
              </div>

              <div className="bg-forest-dark/70 p-3 rounded-xl">
                <span className="text-[10px] text-gray-300 block">Estimated ROI</span>
                <span className="text-sm font-bold text-limeAccent">
                  {metrics?.returnOnInvestmentPct ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* Unit Conversion Guide */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-xs space-y-2 text-secondaryText">
            <h4 className="font-bold text-forest text-sm mb-1">Standard Land Units Guide:</h4>
            <p>• <strong>1 Hectare</strong> = 2.471 Acres = 10,000 sq. meters</p>
            <p>• <strong>1 Acre</strong> = 4,047 sq. meters = 1.6 Pucca Bigha (North India)</p>
            <p>• <strong>1 Quintal</strong> = 100 Kilograms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

