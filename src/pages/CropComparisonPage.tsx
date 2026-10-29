import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  GitCompare,
  Sliders,
  TrendingUp,
  Droplets,
  Calendar,
  Layers,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useFarms } from '../context/FarmContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const CropComparisonPage: React.FC = () => {
  const location = useLocation();
  const { selectedFarm } = useFarms();
  const { language, t } = useLanguage();

  const stateCropIds = (location.state as any)?.cropIds;
  const initialIds = stateCropIds && stateCropIds.length >= 2 ? stateCropIds : ['wheat', 'mustard', 'chickpea'];

  const [selectedCropIds, setSelectedCropIds] = useState<string[]>(initialIds);
  const [areaAcres, setAreaAcres] = useState<number>((location.state as any)?.areaAcres || selectedFarm?.area || 4.0);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [customMultipliers, setCustomMultipliers] = useState<Record<string, number>>({});
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  const fetchComparison = async () => {
    try {
      const items = selectedCropIds.map(id => ({
        cropId: id,
        customYieldMultiplier: customMultipliers[id] ?? 1.0,
        customPricePerQuintal: customPrices[id] ?? undefined,
      }));

      const res = await fetch('/api/v1/crop-comparison/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropIds: selectedCropIds,
          items,
          areaAcres,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setComparisonData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchComparison();
  }, [selectedCropIds, areaAcres, customMultipliers, customPrices]);

  const handleToggleCrop = (cropId: string) => {
    if (selectedCropIds.includes(cropId)) {
      if (selectedCropIds.length <= 2) return; // Keep minimum 2
      setSelectedCropIds(selectedCropIds.filter(id => id !== cropId));
    } else {
      if (selectedCropIds.length >= 4) return; // Max 4
      setSelectedCropIds([...selectedCropIds, cropId]);
    }
  };

  const handlePriceChange = (cropId: string, price: number) => {
    setCustomPrices(prev => ({ ...prev, [cropId]: price }));
  };

  const handleYieldMultiplierChange = (cropId: string, mult: number) => {
    setCustomMultipliers(prev => ({ ...prev, [cropId]: mult }));
  };

  const compared = comparisonData?.comparedCrops || [];
  const tradeOffs = comparisonData?.tradeOffSummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <GitCompare className="w-7 h-7 text-agri" />
            <span>{t.navCropComparison}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Side-by-side multi-crop trade-off analysis with customizable market & yield scenarios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-darkText">Total Farm Area:</label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={areaAcres}
            onChange={e => setAreaAcres(Math.max(0.1, parseFloat(e.target.value) || 1))}
            className="w-20 px-2.5 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-forest focus:ring-2 focus:ring-agri focus:outline-none"
          />
          <span className="text-xs text-secondaryText font-semibold">Acres</span>
        </div>
      </div>

      {/* Crop Selector Badges */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-soft">
        <span className="text-xs font-bold text-secondaryText uppercase tracking-wider block mb-2">
          Select 2 to 4 Crops to Compare:
        </span>
        <div className="flex flex-wrap gap-2">
          {CROPS_DATABASE.map(c => {
            const isSelected = selectedCropIds.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => handleToggleCrop(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-forest text-limeAccent shadow-soft'
                    : 'bg-warmBg text-gray-700 hover:bg-green-50 border border-gray-200'
                }`}
              >
                <span>{c.nameEn} ({c.nameHi})</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trade-off Insights Banner */}
      {tradeOffs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50/70 p-4 rounded-3xl border border-emerald-200 text-xs text-emerald-950">
            <strong className="text-agri block font-bold mb-1">💰 Highest Net Return:</strong>
            <p className="leading-relaxed">{tradeOffs.highestNetReturn}</p>
          </div>
          <div className="bg-blue-50/70 p-4 rounded-3xl border border-blue-200 text-xs text-blue-950">
            <strong className="text-blue-700 block font-bold mb-1">💧 Lowest Water Demand:</strong>
            <p className="leading-relaxed">{tradeOffs.lowestWaterRisk}</p>
          </div>
          <div className="bg-amber-50/70 p-4 rounded-3xl border border-amber-200 text-xs text-amber-950">
            <strong className="text-warningAmber block font-bold mb-1">🛡️ Lowest Initial Capital:</strong>
            <p className="leading-relaxed">{tradeOffs.lowestCapitalCost}</p>
          </div>
        </div>
      )}

      {/* Comparison Matrix Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="bg-warmBg border-b border-gray-100">
              <th className="p-4 font-bold text-forest w-48">Parameter</th>
              {compared.map((c: any) => (
                <th key={c.id} className="p-4 font-extrabold text-forest text-sm">
                  {c.nameEn}
                  <span className="block text-[11px] font-normal text-secondaryText">{c.nameHi}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Category & Season */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Crop Classification</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 font-bold text-darkText">
                  {c.category} • {c.season}
                </td>
              ))}
            </tr>

            {/* Growing Duration */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Growing Duration</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 text-darkText">
                  {c.durationDays.min} - {c.durationDays.max} days
                </td>
              ))}
            </tr>

            {/* Water Need Category & mm */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Water Requirement</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 text-darkText">
                  <span className="font-bold">{c.waterNeedCategory}</span> ({c.waterNeedMm.min} - {c.waterNeedMm.max} mm)
                </td>
              ))}
            </tr>

            {/* Cost Per Acre */}
            <tr className="bg-warmBg/40">
              <td className="p-4 font-semibold text-secondaryText">Production Cost / Acre</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 font-bold text-forest">
                  ₹{c.costPerAcre.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Total Farm Cost */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Total Cost ({areaAcres} Acres)</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 font-extrabold text-forest">
                  ₹{c.totalCost.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Yield Multiplier Adjustment */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">
                Yield Condition Scenario
              </td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4">
                  <select
                    value={customMultipliers[c.id] ?? 1.0}
                    onChange={e => handleYieldMultiplierChange(c.id, parseFloat(e.target.value))}
                    className="p-1 rounded-lg border border-gray-200 text-xs font-semibold"
                  >
                    <option value="1.2">Optimal (+20%)</option>
                    <option value="1.0">Normal (100%)</option>
                    <option value="0.8">Adverse Weather (-20%)</option>
                  </select>
                </td>
              ))}
            </tr>

            {/* Expected Yield */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Expected Yield / Acre</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 font-bold text-darkText">
                  {c.yieldRangeQuintal.avg} Quintals
                  <span className="block text-[10px] text-secondaryText">Range: {c.yieldRangeQuintal.min} - {c.yieldRangeQuintal.max}</span>
                </td>
              ))}
            </tr>

            {/* Selling Price */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Selling Price (₹ / Qtl)</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4">
                  <input
                    type="number"
                    value={customPrices[c.id] ?? c.typicalPricePerQuintal}
                    onChange={e => handlePriceChange(c.id, Number(e.target.value))}
                    className="w-24 px-2 py-1 rounded-lg border border-gray-200 text-xs font-bold"
                  />
                </td>
              ))}
            </tr>

            {/* Gross Revenue */}
            <tr className="bg-warmBg/40">
              <td className="p-4 font-semibold text-secondaryText">Total Gross Revenue</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 font-bold text-forest">
                  ₹{c.totalGrossRevenue.toLocaleString('en-IN')}
                </td>
              ))}
            </tr>

            {/* Net Return Highlight */}
            <tr className="bg-green-50/50">
              <td className="p-4 font-extrabold text-agri">Estimated Net Return</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4">
                  <span className={`text-base font-extrabold ${c.totalEstimatedNetReturn > 0 ? 'text-agri' : 'text-criticalRed'}`}>
                    ₹{c.totalEstimatedNetReturn.toLocaleString('en-IN')}
                  </span>
                  <span className="block text-[11px] text-secondaryText">
                    (₹{c.estimatedNetReturnPerAcre.toLocaleString('en-IN')} / acre)
                  </span>
                </td>
              ))}
            </tr>

            {/* Break-even selling price */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Break-Even Price / Qtl</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 font-bold text-darkText">
                  ₹{c.breakEvenPricePerQuintal}
                </td>
              ))}
            </tr>

            {/* Estimated ROI */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Estimated ROI (%)</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 font-extrabold text-forest">
                  {c.returnOnInvestmentPct}%
                </td>
              ))}
            </tr>

            {/* Key Risks */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Key Disease / Stress Risks</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 text-[11px] text-gray-700 space-y-1">
                  {c.diseaseRisks.map((d: any, idx: number) => (
                    <div key={idx}>• {d.nameEn}</div>
                  ))}
                </td>
              ))}
            </tr>

            {/* Citation */}
            <tr>
              <td className="p-4 font-semibold text-secondaryText">Benchmark Citation</td>
              {compared.map((c: any) => (
                <td key={c.id} className="p-4 text-[10px] text-secondaryText">
                  {c.citation}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

