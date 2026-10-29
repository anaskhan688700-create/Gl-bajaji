import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sprout,
  MapPin,
  Calendar,
  Droplets,
  Layers,
  FileText,
  Save,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const FarmDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { farms, updateFarm } = useFarms();
  const { language, t } = useLanguage();

  const farm = farms.find(f => f.id === id) || farms[0];
  const crop = CROPS_DATABASE.find(c => c.id === farm?.currentCropId) || CROPS_DATABASE[0];

  const [notes, setNotes] = useState(farm?.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (farm) setNotes(farm.notes || '');
  }, [farm]);

  const handleSaveNotes = async () => {
    if (!farm) return;
    await updateFarm(farm.id, { notes });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  if (!farm) {
    return (
      <div className="text-center py-12">
        <p className="text-secondaryText dark:text-darkTextSecondary text-sm">Farm not found.</p>
        <Link to="/farms" className="text-agri font-bold text-xs mt-2 inline-block">
          Return to Farm List
        </Link>
      </div>
    );
  }

  const stages = Object.keys(crop.stageThresholds);

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/farms"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-limeAccent hover:text-agri transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Farms</span>
        </Link>

        <span className="text-xs font-mono font-bold text-secondaryText dark:text-darkTextSecondary">
          ID: {farm.id}
        </span>
      </div>

      {/* Main Farm Hero */}
      <div className="bg-white dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-darkBorder shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 dark:border-darkBorder">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 dark:bg-forest text-agri dark:text-limeAccent border border-green-200 dark:border-forest-light inline-block mb-2">
              {farm.area} {farm.areaUnit} • {farm.soilType}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-forest dark:text-darkTextPrimary">
              {farm.name}
            </h1>
            <p className="text-xs sm:text-sm text-secondaryText dark:text-darkTextSecondary flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-agri" />
              {farm.location.villageOrBlock ? `${farm.location.villageOrBlock}, ` : ''}
              {farm.location.district}, {farm.location.state}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/crop-health"
              className="px-4 py-2.5 rounded-xl bg-agri text-white font-bold text-xs hover:bg-agri-dark transition-colors shadow-soft"
            >
              View Crop Health Alerts
            </Link>
            <Link
              to="/crop-advisor"
              className="px-4 py-2.5 rounded-xl bg-forest dark:bg-forest-light text-limeAccent font-bold text-xs hover:bg-forest-light transition-colors shadow-soft"
            >
              Next Season Advisor
            </Link>
          </div>
        </div>

        {/* 4 Metadata Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-warmBg dark:bg-darkSurface p-4 rounded-2xl">
            <span className="text-xs text-secondaryText dark:text-darkTextSecondary font-medium">Cultivated Crop</span>
            <p className="text-sm font-bold text-forest dark:text-limeAccent mt-0.5">
              {crop.nameEn} ({crop.nameHi})
            </p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{farm.cropVariety || 'Standard Variety'}</span>
          </div>

          <div className="bg-warmBg dark:bg-darkSurface p-4 rounded-2xl">
            <span className="text-xs text-secondaryText dark:text-darkTextSecondary font-medium">Sowing Date</span>
            <p className="text-sm font-bold text-forest dark:text-darkTextPrimary mt-0.5">{farm.sowingDate}</p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Harvest: ~{farm.expectedHarvestDate}</span>
          </div>

          <div className="bg-warmBg dark:bg-darkSurface p-4 rounded-2xl">
            <span className="text-xs text-secondaryText dark:text-darkTextSecondary font-medium">Irrigation Method</span>
            <p className="text-sm font-bold text-forest dark:text-darkTextPrimary mt-0.5">{farm.irrigationMethod}</p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">Water Need: {crop.waterNeedCategory}</span>
          </div>

          <div className="bg-warmBg dark:bg-darkSurface p-4 rounded-2xl">
            <span className="text-xs text-secondaryText dark:text-darkTextSecondary font-medium">Soil Health Status</span>
            <p className="text-sm font-bold text-agri dark:text-limeAccent mt-0.5">
              Optimal Fertility
            </p>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">pH {crop.optimalPh.min} - {crop.optimalPh.max}</span>
          </div>
        </div>
      </div>

      {/* Growth Stage Progression Timeline */}
      <div className="bg-white dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-darkBorder shadow-soft">
        <h3 className="text-base font-bold text-forest dark:text-darkTextPrimary mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-agri" />
          <span>Crop Growth Stages & Moisture Benchmarks</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {stages.map((stg, idx) => {
            const isCurrent = farm.growthStage.includes(stg.split(' ')[0]) || farm.growthStage === stg;
            const threshold = crop.stageThresholds[stg];

            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border text-xs transition-all ${
                  isCurrent
                    ? 'bg-green-50/70 dark:bg-forest/60 border-agri shadow-soft ring-1 ring-agri'
                    : 'bg-warmBg dark:bg-darkSurface border-gray-200 dark:border-darkBorder'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest dark:text-limeAccent text-[11px]">Stage {idx + 1}</span>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-agri text-white">
                      ACTIVE
                    </span>
                  )}
                </div>
                <h4 className="font-semibold text-darkText dark:text-darkTextPrimary mb-2 text-xs leading-snug">{stg}</h4>
                <div className="text-[11px] text-secondaryText dark:text-darkTextSecondary space-y-1">
                  <p>Optimal: <strong className="text-darkText dark:text-darkTextPrimary">{threshold.minMoisture}-{threshold.maxMoisture}%</strong></p>
                  <p>Critical Stress: <strong className="text-criticalRed">&lt;{threshold.waterStressAlert}%</strong></p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Field Observations and Agronomic Notes */}
      <div className="bg-white dark:bg-darkCard rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-darkBorder shadow-soft">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-forest dark:text-darkTextPrimary flex items-center gap-2">
            <FileText className="w-5 h-5 text-agri" />
            <span>Field Observations & Agronomic Diary</span>
          </h3>
          {isSaved && (
            <span className="text-xs font-bold text-agri dark:text-limeAccent flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Notes Saved!
            </span>
          )}
        </div>
        <p className="text-xs text-secondaryText dark:text-darkTextSecondary mb-3">
          Log fertilizer applications, weed inspections, or specific field conditions observed during visits.
        </p>

        <textarea
          rows={4}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Applied first dose of Urea (45 kg/acre) along with Zinc Sulphate. Minor yellowing observed on northern boundary."
          className="w-full p-3 rounded-2xl border border-gray-200 dark:border-darkBorder dark:bg-darkSurface dark:text-darkTextPrimary text-xs sm:text-sm focus:ring-2 focus:ring-agri focus:outline-none"
        />

        <div className="mt-3 flex justify-end">
          <button
            onClick={handleSaveNotes}
            className="px-4 py-2 rounded-xl bg-forest dark:bg-forest-light text-limeAccent font-bold text-xs hover:bg-forest-light transition-colors flex items-center gap-1.5 shadow-soft"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Observations</span>
          </button>
        </div>
      </div>
    </div>
  );
};
