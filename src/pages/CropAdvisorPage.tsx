import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitCompare,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const CropAdvisorPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedFarm } = useFarms();
  const { language, t } = useLanguage();

  const [season, setSeason] = useState<'Rabi' | 'Kharif' | 'Zaid'>('Rabi');
  const [soilType, setSoilType] = useState<string>(selectedFarm?.soilType || 'Loam');
  const [irrigation, setIrrigation] = useState<string>(selectedFarm?.irrigationMethod || 'Tube Well');
  const [areaAcres, setAreaAcres] = useState<number>(selectedFarm?.area || 4.0);
  const [previousCropId, setPreviousCropId] = useState<string>(selectedFarm?.currentCropId || 'wheat');
  const [budgetPerAcre, setBudgetPerAcre] = useState<number>(20000);
  const [preferredCategory, setPreferredCategory] = useState<string>('All');
  const [soilPh, setSoilPh] = useState<string>('6.8');

  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/crop-advisor/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmId: selectedFarm?.id,
          state: selectedFarm?.location.state || 'Haryana',
          district: selectedFarm?.location.district || 'Karnal',
          soilType,
          soilPh: soilPh ? parseFloat(soilPh) : undefined,
          season,
          irrigationAvailability: irrigation,
          areaAcres,
          previousCropId,
          budgetPerAcre,
          preferredCategory,
        }),
      });
      const data = await res.json();
      if (data.success && data.recommendations) {
        setRecommendations(data.recommendations);
        if (selectedForComparison.length === 0 && data.recommendations.length >= 2) {
          setSelectedForComparison(data.recommendations.slice(0, 3).map((r: any) => r.cropId));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [season, soilType, irrigation, previousCropId, preferredCategory]);

  const toggleSelectForComparison = (cropId: string) => {
    if (selectedForComparison.includes(cropId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== cropId));
    } else {
      if (selectedForComparison.length >= 4) return;
      setSelectedForComparison([...selectedForComparison, cropId]);
    }
  };

  const handleLaunchComparison = () => {
    navigate('/crop-comparison', {
      state: { cropIds: selectedForComparison, areaAcres },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest dark:text-darkTextPrimary flex items-center gap-2">
            <Compass className="w-7 h-7 text-agri" />
            <span>{t.navCropAdvisor}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText dark:text-darkTextSecondary">
            Multi-factor suitability model for optimal next-season crop planning
          </p>
        </div>

        {selectedForComparison.length >= 2 && (
          <button
            onClick={handleLaunchComparison}
            className="px-4 py-2.5 rounded-xl bg-forest dark:bg-forest-light text-limeAccent font-bold text-xs sm:text-sm hover:bg-forest-light transition-colors flex items-center gap-2 shadow-soft self-start sm:self-auto animate-in fade-in"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Selected ({selectedForComparison.length})</span>
          </button>
        )}
      </div>

      {/* Input Configuration Filters */}
      <div className="bg-white dark:bg-darkCard rounded-3xl p-6 border border-gray-100 dark:border-darkBorder shadow-soft">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 dark:border-darkBorder">
          <Filter className="w-4 h-4 text-agri" />
          <h3 className="text-xs font-bold text-forest dark:text-darkTextPrimary uppercase tracking-wider">
            Planning Parameters (सीजन एवं भूमि इनपुट)
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div>
            <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Target Season</label>
            <select
              value={season}
              onChange={e => setSeason(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            >
              <option value="Rabi">Rabi (सर्दियां / Nov-Apr)</option>
              <option value="Kharif">Kharif (मानसून / Jun-Oct)</option>
              <option value="Zaid">Zaid (गर्मियां / Mar-Jun)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Soil Texture</label>
            <select
              value={soilType}
              onChange={e => setSoilType(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            >
              <option value="Loam">Loam (दोमट)</option>
              <option value="Clay Loam">Clay Loam</option>
              <option value="Sandy Loam">Sandy Loam</option>
              <option value="Black Soil (Regur)">Black Soil (काली)</option>
              <option value="Alluvial">Alluvial (जलोढ़)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Irrigation Setup</label>
            <select
              value={irrigation}
              onChange={e => setIrrigation(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            >
              <option value="Tube Well">Tube Well</option>
              <option value="Drip">Drip Irrigation</option>
              <option value="Sprinkler">Sprinkler</option>
              <option value="Canal / Flood">Canal / Flood</option>
              <option value="Rainfed">Rainfed (बारानी)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Previous Crop</label>
            <select
              value={previousCropId}
              onChange={e => setPreviousCropId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            >
              {CROPS_DATABASE.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Max Budget (₹/Acre)</label>
            <input
              type="number"
              step="1000"
              value={budgetPerAcre}
              onChange={e => setBudgetPerAcre(Number(e.target.value) || 0)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-darkText dark:text-darkTextPrimary mb-1">Category Filter</label>
            <select
              value={preferredCategory}
              onChange={e => setPreferredCategory(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Cereal">Cereals (अनाज)</option>
              <option value="Pulse">Pulses (दलहन)</option>
              <option value="Oilseed">Oilseeds (तिलहन)</option>
              <option value="Vegetable">Vegetables (सब्जियां)</option>
              <option value="Commercial">Commercial / Cash</option>
            </select>
          </div>
        </div>
      </div>

      {/* Ranked Candidate Crops List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-forest dark:text-darkTextPrimary">
            Recommended Candidate Crops ({recommendations.length} evaluated)
          </h2>
          <span className="text-xs text-secondaryText dark:text-darkTextSecondary">
            Ranked by Weighted Agronomic Suitability Score
          </span>
        </div>

        {recommendations.map((rec, index) => {
          const isSelected = selectedForComparison.includes(rec.cropId);

          return (
            <div
              key={rec.cropId}
              className={`bg-white dark:bg-darkCard rounded-3xl p-6 border transition-all shadow-soft ${
                index === 0
                  ? 'border-agri/80 dark:border-agri ring-1 ring-agri/30'
                  : 'border-gray-100 dark:border-darkBorder hover:border-gray-200 dark:hover:border-forest-light'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-4 border-b border-gray-100 dark:border-darkBorder">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-warmBg dark:bg-darkSurface text-forest dark:text-limeAccent font-extrabold text-base flex items-center justify-center flex-shrink-0">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-forest dark:text-darkTextPrimary">
                        {rec.nameEn} ({rec.nameHi})
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 dark:bg-darkSurface text-gray-700 dark:text-darkTextSecondary">
                        {rec.category}
                      </span>
                      {index === 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-forest text-agri dark:text-limeAccent">
                          Top Match
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-secondaryText dark:text-darkTextSecondary mt-0.5">
                      {rec.explanationEn}
                    </p>
                  </div>
                </div>

                {/* Score Pill & Compare Checkbox */}
                <div className="flex items-center gap-4 self-start lg:self-auto">
                  <div className="text-right">
                    <span className="text-[11px] text-secondaryText dark:text-darkTextSecondary font-bold uppercase block">
                      Suitability
                    </span>
                    <span className="text-xl font-extrabold text-forest dark:text-limeAccent">
                      {rec.suitabilityScore}%
                    </span>
                  </div>

                  <button
                    onClick={() => toggleSelectForComparison(rec.cropId)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-agri text-white shadow-soft'
                        : 'bg-warmBg dark:bg-darkSurface text-forest dark:text-darkTextPrimary hover:bg-gray-100 dark:hover:bg-darkBorder border border-gray-200 dark:border-darkBorder'
                    }`}
                  >
                    <span>{isSelected ? '✓ Selected' : '+ Compare'}</span>
                  </button>
                </div>
              </div>

              {/* Score Dimensions & Economics Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 py-4 text-xs">
                <div className="bg-warmBg dark:bg-darkSurface p-3 rounded-2xl">
                  <span className="text-secondaryText dark:text-darkTextSecondary text-[11px] block">Duration</span>
                  <span className="font-bold text-darkText dark:text-darkTextPrimary">{rec.durationRangeDays}</span>
                </div>

                <div className="bg-warmBg dark:bg-darkSurface p-3 rounded-2xl">
                  <span className="text-secondaryText dark:text-darkTextSecondary text-[11px] block">Water Need</span>
                  <span className="font-bold text-darkText dark:text-darkTextPrimary">{rec.waterCategory}</span>
                </div>

                <div className="bg-warmBg dark:bg-darkSurface p-3 rounded-2xl">
                  <span className="text-secondaryText dark:text-darkTextSecondary text-[11px] block">Est. Cost / Acre</span>
                  <span className="font-bold text-darkText dark:text-darkTextPrimary">₹{rec.economics.costPerAcre.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-warmBg dark:bg-darkSurface p-3 rounded-2xl">
                  <span className="text-secondaryText dark:text-darkTextSecondary text-[11px] block">Avg. Yield / Acre</span>
                  <span className="font-bold text-darkText dark:text-darkTextPrimary">{rec.economics.expectedYieldPerAcreQuintal.avg} Qtl</span>
                </div>

                <div className="bg-warmBg dark:bg-darkSurface p-3 rounded-2xl">
                  <span className="text-secondaryText dark:text-darkTextSecondary text-[11px] block">Est. Net Return</span>
                  <span className={`font-bold ${rec.economics.estimatedNetReturnPerAcre > 0 ? 'text-agri dark:text-limeAccent' : 'text-criticalRed'}`}>
                    ₹{rec.economics.estimatedNetReturnPerAcre.toLocaleString('en-IN')}/acre
                  </span>
                </div>

                <div className="bg-warmBg dark:bg-darkSurface p-3 rounded-2xl">
                  <span className="text-secondaryText dark:text-darkTextSecondary text-[11px] block">Break-Even Price</span>
                  <span className="font-bold text-darkText dark:text-darkTextPrimary">₹{rec.economics.breakEvenPricePerQuintal}/Qtl</span>
                </div>
              </div>

              {/* Caveats and Missing Information Warnings */}
              {rec.missingDataCaveats && rec.missingDataCaveats.length > 0 && (
                <div className="pt-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 p-3 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
                  <strong className="block mb-0.5">⚠️ Model Assumptions & Caveats:</strong>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {rec.missingDataCaveats.map((cav: string, i: number) => (
                      <li key={i}>{cav}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
