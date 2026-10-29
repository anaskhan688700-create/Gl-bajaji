import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Sprout, MapPin, Droplets, Cpu, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';
import { useLanguage } from '../context/LanguageContext';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { createFarm } = useFarms();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'Kisan Adarsh Farm',
    state: 'Haryana',
    district: 'Karnal',
    villageOrBlock: 'Nilokheri Block',
    area: 4.0,
    areaUnit: 'Acre' as 'Acre' | 'Hectare' | 'Bigha',
    soilType: 'Loam',
    irrigationMethod: 'Tube Well' as 'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Tube Well' | 'Rainfed',
    currentCropId: 'wheat',
    cropVariety: 'HD-3086',
    sowingDate: new Date().toISOString().split('T')[0],
    growthStage: 'Flowering / Boot Stage (70-80 DAS)',
    assignedDeviceId: 'ESP32-KR-001',
    isSimulationSelected: true,
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    await createFarm(formData);
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-warmBg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-agri flex items-center justify-center text-limeAccent font-bold shadow-soft mx-auto mb-3">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest">
            Farm Setup Wizard (ऑनबोर्डिंग)
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText mt-1">
            Let's configure your field and soil baseline in 4 simple steps
          </p>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s
                    ? 'bg-agri text-white shadow-soft scale-110'
                    : step > s
                    ? 'bg-forest text-limeAccent'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Box */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-elevated">
          {/* STEP 1: Farm & Location */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-agri" />
                <h3 className="font-bold text-base text-forest">Step 1: Farm & Location</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Farm Name / खेत का नाम
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1">
                    State / राज्य
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={e => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1">
                    District / जिला
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Village / Block (Optional)
                </label>
                <input
                  type="text"
                  value={formData.villageOrBlock}
                  onChange={e => setFormData({ ...formData, villageOrBlock: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                  placeholder="e.g. Nilokheri Block"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Soil & Irrigation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Droplets className="w-5 h-5 text-agri" />
                <h3 className="font-bold text-base text-forest">Step 2: Soil & Irrigation</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1">
                    Farm Area / खेत का क्षेत्रफल
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.area}
                    onChange={e => setFormData({ ...formData, area: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1">
                    Area Unit / इकाई
                  </label>
                  <select
                    value={formData.areaUnit}
                    onChange={e => setFormData({ ...formData, areaUnit: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                  >
                    <option value="Acre">Acre (एकड़)</option>
                    <option value="Hectare">Hectare (हेक्टेयर)</option>
                    <option value="Bigha">Bigha (बीघा)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Soil Type / मिट्टी का प्रकार
                </label>
                <select
                  value={formData.soilType}
                  onChange={e => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                >
                  <option value="Loam">Loam (दोमट मिट्टी)</option>
                  <option value="Clay Loam">Clay Loam (चिकनी दोमट)</option>
                  <option value="Sandy Loam">Sandy Loam (बलुई दोमट)</option>
                  <option value="Black Soil (Regur)">Black Soil (काली मिट्टी / रेगुड़)</option>
                  <option value="Alluvial">Alluvial (जलोढ़ मिट्टी)</option>
                  <option value="Red Loam">Red Loam (लाल दोमट)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Primary Irrigation Method / सिंचाई विधि
                </label>
                <select
                  value={formData.irrigationMethod}
                  onChange={e => setFormData({ ...formData, irrigationMethod: e.target.value as any })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                >
                  <option value="Tube Well">Tube Well (नलकूप / बोरवेल)</option>
                  <option value="Drip">Drip Irrigation (ड्रिप / टपक)</option>
                  <option value="Sprinkler">Sprinkler (फव्वारा)</option>
                  <option value="Canal / Flood">Canal / Flood (नहर / खुला पानी)</option>
                  <option value="Rainfed">Rainfed (वर्षा आधारित / बारानी)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Current Crop */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Sprout className="w-5 h-5 text-agri" />
                <h3 className="font-bold text-base text-forest">Step 3: Current Crop & Growth Stage</h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Selected Crop / वर्तमान फसल
                </label>
                <select
                  value={formData.currentCropId}
                  onChange={e => setFormData({ ...formData, currentCropId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri font-semibold"
                >
                  {CROPS_DATABASE.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn} ({c.nameHi}) — {c.category} ({c.season})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1">
                    Crop Variety / किस्म
                  </label>
                  <input
                    type="text"
                    value={formData.cropVariety}
                    onChange={e => setFormData({ ...formData, cropVariety: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                    placeholder="e.g. HD-3086"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-darkText mb-1">
                    Sowing Date / बुवाई की तारीख
                  </label>
                  <input
                    type="date"
                    value={formData.sowingDate}
                    onChange={e => setFormData({ ...formData, sowingDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Current Growth Stage / फसल की अवस्था
                </label>
                <select
                  value={formData.growthStage}
                  onChange={e => setFormData({ ...formData, growthStage: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                >
                  <option value="Crown Root Initiation (20-25 DAS)">Crown Root Initiation (20-25 DAS)</option>
                  <option value="Tillering (40-45 DAS)">Tillering (40-45 DAS)</option>
                  <option value="Flowering / Boot Stage (70-80 DAS)">Flowering / Boot Stage (70-80 DAS)</option>
                  <option value="Milking / Grain Filling (90-105 DAS)">Milking / Grain Filling (90-105 DAS)</option>
                  <option value="Maturity / Ripening">Maturity / Ripening</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Sensor Hardware */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Cpu className="w-5 h-5 text-agri" />
                <h3 className="font-bold text-base text-forest">Step 4: IoT Hardware & Sensor Setup</h3>
              </div>

              <div className="p-4 rounded-2xl bg-warmBg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-forest">IoT Ingestion Mode</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-agri">
                    ESP32 Compatible
                  </span>
                </div>
                <p className="text-xs text-secondaryText leading-relaxed">
                  You can connect physical hardware later using the REST endpoint and your farm's unique API token. For this demo, simulated field readings will be active.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-darkText mb-1">
                  Assigned Hardware Node ID
                </label>
                <input
                  type="text"
                  value={formData.assignedDeviceId}
                  onChange={e => setFormData({ ...formData, assignedDeviceId: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-agri"
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 text-xs text-emerald-900">
                <p className="font-bold flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-agri" />
                  <span>Ready to Monitor</span>
                </p>
                <p>
                  Upon completion, your dashboard will calculate soil moisture stress, temperature dynamics, and rule-based risk alerts immediately.
                </p>
              </div>
            </div>
          )}

          {/* Nav Controls */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-darkText hover:bg-gray-50 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-forest text-limeAccent font-bold text-xs hover:bg-forest-light flex items-center gap-1.5 shadow-soft"
              >
                Next Step
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="px-6 py-2.5 rounded-xl bg-agri text-white font-bold text-xs hover:bg-agri-dark flex items-center gap-1.5 shadow-soft"
              >
                Launch Dashboard
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

