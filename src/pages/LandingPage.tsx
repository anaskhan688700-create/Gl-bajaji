import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sprout,
  Activity,
  ShieldAlert,
  Compass,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Calculator,
  BotMessageSquare,
  Globe,
  Leaf,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchDemoRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLaunchDemo = async (role: 'farmer' | 'admin') => {
    await switchDemoRole(role);
    navigate('/overview');
  };

  return (
    <div className="min-h-screen bg-warmBg text-darkText font-sans selection:bg-limeAccent selection:text-forest">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-agri flex items-center justify-center text-limeAccent font-bold shadow-soft">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-xl text-forest tracking-tight flex items-center gap-1">
                KisanRakshak <span className="text-limeAccent font-extrabold text-xs uppercase px-1.5 py-0.5 rounded bg-forest">AI</span>
              </span>
              <span className="hidden sm:block text-[11px] text-secondaryText">किसानरक्षक AI</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5 text-xs font-semibold">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  language === 'en' ? 'bg-forest text-white' : 'text-secondaryText hover:text-darkText'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  language === 'hi' ? 'bg-forest text-limeAccent' : 'text-secondaryText hover:text-darkText'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={() => handleLaunchDemo('farmer')}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-agri text-white hover:bg-agri-dark transition-all shadow-soft flex items-center gap-1.5"
            >
              <span>{t.demoMode}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-gray-200 bg-gradient-to-b from-white via-warmBg to-warmBg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 border border-green-200 text-forest text-xs font-bold mb-6">
            <span className="w-2 h-2 rounded-full bg-agri animate-pulse"></span>
            <span>Intelligent Crop Protection & Multi-Factor Planning for Indian Agriculture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-forest tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            {language === 'hi'
              ? 'मिट्टी की सही देखभाल, सटीक चेतावनी और अगले सीजन की पक्की फसल योजना'
              : 'Protect Today’s Harvest. Predict Tomorrow’s Best Season Crop.'}
          </h1>

          <p className="text-base sm:text-lg text-secondaryText max-w-2xl mx-auto mb-10 leading-relaxed">
            {language === 'hi'
              ? 'KisanRakshak AI खेत में लगे IoT सेंसर, मौसम और ICAR कृषि वैज्ञानिक नियमों को मिलाकर सही समय पर अलर्ट देता है और लागत-मुनाफे की स्पष्ट गणना करता है।'
              : 'Combining real-time IoT soil telemetry, microclimate early warning rules, and next-season crop suitability rankings into a farmer-friendly bilingual platform.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <button
              onClick={() => handleLaunchDemo('farmer')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-forest text-limeAccent font-bold text-sm sm:text-base hover:bg-forest-light transition-all shadow-elevated flex items-center justify-center gap-2"
            >
              <span>👨‍🌾 Launch Farmer Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleLaunchDemo('admin')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-gray-300 text-forest font-bold text-sm sm:text-base hover:bg-gray-50 transition-all shadow-soft flex items-center justify-center gap-2"
            >
              <span>🔬 Explore Admin Dashboard</span>
            </button>
          </div>

          {/* Quick Metrics Banner */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
              <span className="text-2xl font-extrabold text-forest">10+</span>
              <p className="text-xs text-secondaryText font-medium mt-1">IoT Sensors Monitored</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
              <span className="text-2xl font-extrabold text-agri">100%</span>
              <p className="text-xs text-secondaryText font-medium mt-1">Explainable Rule Engine</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
              <span className="text-2xl font-extrabold text-forest">₹ / Acre</span>
              <p className="text-xs text-secondaryText font-medium mt-1">Transparent Economics</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
              <span className="text-2xl font-extrabold text-agri">हिन्दी & EN</span>
              <p className="text-xs text-secondaryText font-medium mt-1">Bilingual Voice & Text</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-forest">
            Engineered for Ground-Level Impact
          </h2>
          <p className="text-sm text-secondaryText mt-2">
            Built following Indian Council of Agricultural Research (ICAR) benchmark guidelines
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-agri flex items-center justify-center mb-4">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-forest mb-2">IoT Soil & Weather Telemetry</h3>
            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
              Track moisture at root depth, soil temp, ambient humidity, and soil pH in real-time. Supports ESP32 hardware and an integrated simulation engine with 5 interactive field scenarios.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-warningAmber flex items-center justify-center mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-forest mb-2">Crop-Specific Early Warning</h3>
            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
              Transparent rule-based risk flags that distinguish moisture stress, heat stress, and fungal disease micro-climates. Never presents premature diagnoses without clear evidence.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-soft hover:shadow-card transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-lime-50 text-forest flex items-center justify-center mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-forest mb-2">AI Next-Season Crop Advisor</h3>
            <p className="text-xs sm:text-sm text-secondaryText leading-relaxed">
              Multi-factor suitability ranking considering soil type, season, water availability, crop rotation benefits, and farmer budget. Side-by-side comparison with trade-off analysis.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 bg-white text-xs text-secondaryText">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-agri" />
            <span className="font-bold text-forest">KisanRakshak AI</span>
            <span>— Developed for VECNAVERSE Hackathon</span>
          </div>
          <p>© 2026 KisanRakshak AI. All agronomic models aligned with ICAR standards.</p>
        </div>
      </footer>
    </div>
  );
};

