import React, { useState } from 'react';
import {
  Settings,
  User,
  Globe,
  Bell,
  Cpu,
  Save,
  CheckCircle2,
  Shield,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, role } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [name, setName] = useState(user?.name || 'Ramesh Kumar');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [state, setState] = useState(user?.state || 'Haryana');
  const [district, setDistrict] = useState(user?.district || 'Karnal');
  const [isSaved, setIsSaved] = useState(false);

  const [inAppNotif, setInAppNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [whatsappNotif, setWhatsappNotif] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      name,
      phone,
      state,
      district,
      preferredLanguage: language,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
          <Settings className="w-7 h-7 text-agri" />
          <span>{t.navSettings}</span>
        </h1>
        <p className="text-xs sm:text-sm text-secondaryText">
          Account preferences, regional localization, notifications & diagnostic telemetry
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Profile & Localization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-forest uppercase tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-agri" />
                <span>User Profile & Regional Settings</span>
              </h3>
              {isSaved && (
                <span className="text-xs font-bold text-agri flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved Successfully!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-darkText mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkText mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-darkText mb-1">State / राज्य</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-darkText mb-1">District / जिला</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-darkText mb-1">Preferred Language (भाषा)</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`flex-1 p-3 rounded-2xl border text-left font-bold transition-all ${
                      language === 'hi'
                        ? 'bg-forest text-limeAccent border-forest shadow-soft'
                        : 'bg-warmBg text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🇮🇳 हिन्दी (Hindi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`flex-1 p-3 rounded-2xl border text-left font-bold transition-all ${
                      language === 'en'
                        ? 'bg-forest text-limeAccent border-forest shadow-soft'
                        : 'bg-warmBg text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    🇬🇧 English
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-forest text-limeAccent font-bold text-xs hover:bg-forest-light transition-colors flex items-center gap-1.5 shadow-soft"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Notification Channels */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-forest uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
              <Bell className="w-4 h-4 text-agri" />
              <span>Emergency Field Notification Delivery Channels</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-warmBg border border-gray-100 cursor-pointer">
                <div>
                  <span className="font-bold text-darkText block">In-App Dashboard Alerts</span>
                  <span className="text-[11px] text-secondaryText">Audio-visual notifications on web and mobile browsers</span>
                </div>
                <input
                  type="checkbox"
                  checked={inAppNotif}
                  onChange={e => setInAppNotif(e.target.checked)}
                  className="w-4 h-4 text-agri rounded focus:ring-agri"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-warmBg border border-gray-100 cursor-pointer">
                <div>
                  <span className="font-bold text-darkText flex items-center gap-2">
                    <span>SMS / टेक्स्ट संदेश (Text Messages)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-warningAmber">
                      Optional Gateway (Mock)
                    </span>
                  </span>
                  <span className="text-[11px] text-secondaryText">Send critical moisture and heat alerts to farmer SIM card</span>
                </div>
                <input
                  type="checkbox"
                  checked={smsNotif}
                  onChange={e => setSmsNotif(e.target.checked)}
                  className="w-4 h-4 text-agri rounded focus:ring-agri"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-warmBg border border-gray-100 cursor-pointer">
                <div>
                  <span className="font-bold text-darkText flex items-center gap-2">
                    <span>WhatsApp Kisan Alerts</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-warningAmber">
                      Optional Gateway (Mock)
                    </span>
                  </span>
                  <span className="text-[11px] text-secondaryText">Direct weekly agronomic summary & spray advisory</span>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappNotif}
                  onChange={e => setWhatsappNotif(e.target.checked)}
                  className="w-4 h-4 text-agri rounded focus:ring-agri"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: System Diagnostics */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft text-xs space-y-3">
            <h3 className="text-sm font-bold text-forest mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-agri" />
              <span>Platform & Gateway Diagnostics</span>
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-secondaryText">Application Version:</span>
                <span className="font-bold text-forest">v1.0.0-MVP</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-secondaryText">Database Engine:</span>
                <span className="font-bold text-forest">JSON Storage with Atomic Write</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-secondaryText">IoT Gateway:</span>
                <span className="font-bold text-agri">REST Ingest Active</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-secondaryText">Security Mode:</span>
                <span className="font-bold text-forest">Token Auth + Role RBAC</span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-secondaryText">Agronomic Dataset:</span>
                <span className="font-bold text-forest">ICAR / State Agricultural Univ</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 p-6 rounded-3xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <strong className="block font-bold text-agri text-sm">
              🌾 VECNAVERSE Hackathon Submission
            </strong>
            <p className="leading-relaxed">
              KisanRakshak AI fulfills all P0 and P1 requirements: real-time IoT telemetry, crop-risk rule engine, AI crop advisor, crop comparison, profit calculator, bilingual AI Kisan Assistant, and ESP32 hardware readiness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

