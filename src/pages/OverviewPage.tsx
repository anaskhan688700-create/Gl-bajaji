import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplets,
  Thermometer,
  CloudRain,
  FlaskConical,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Compass,
  Calculator,
  BotMessageSquare,
  Sparkles,
  Camera,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useSensors } from '../context/SensorContext';
import { useLanguage } from '../context/LanguageContext';
import { MetricCard } from '../components/common/MetricCard';
import { AlertBanner } from '../components/common/AlertBanner';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const OverviewPage: React.FC = () => {
  const { selectedFarm } = useFarms();
  const { latestTelemetry, activeAlerts, dismissAlert, markAlertAsRead } = useSensors();
  const { language, t } = useLanguage();

  const [healthData, setHealthData] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  const farmId = selectedFarm?.id || 'farm-01';
  const crop = CROPS_DATABASE.find(c => c.id === selectedFarm?.currentCropId) || CROPS_DATABASE[0];

  useEffect(() => {
    if (!farmId) return;
    fetch(`/api/v1/crop-health/${farmId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setHealthData(data.evaluation);
      })
      .catch(() => {});

    fetch(`/api/v1/weather/${farmId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setWeatherData(data);
      })
      .catch(() => {});
  }, [farmId, latestTelemetry]);

  const moisture = latestTelemetry?.soilMoisture ?? 42;
  const soilTemp = latestTelemetry?.soilTemperature ?? 20.4;
  const ambTemp = latestTelemetry?.ambientTemperature ?? 22.8;
  const humidity = latestTelemetry?.relativeHumidity ?? 62;
  const ph = latestTelemetry?.soilPh ?? 6.8;

  const healthScore = healthData?.score ?? 85;
  const overallRisk = healthData?.overallRisk ?? 'Normal';

  return (
    <div className="space-y-6">
      {/* Top Welcome / Farm Summary Banner */}
      <div className="bg-gradient-to-r from-forest via-forest-light to-agri rounded-3xl p-6 sm:p-8 text-white shadow-elevated relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-limeAccent text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-limeAccent animate-pulse" />
              <span>Real-Time Field Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {selectedFarm?.name || 'Kisan Krishi Farm'}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-200 mt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-limeAccent" />
                {selectedFarm?.location.district}, {selectedFarm?.location.state}
              </span>
              <span>•</span>
              <span>{selectedFarm?.area} {selectedFarm?.areaUnit}</span>
              <span>•</span>
              <span className="font-semibold text-limeAccent">
                {crop.nameEn} ({crop.nameHi})
              </span>
              <span>•</span>
              <span className="text-gray-300">{selectedFarm?.growthStage}</span>
            </div>
          </div>

          {/* Health Score Badge */}
          <div className="flex items-center gap-4 bg-white/10 dark:bg-black/20 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 self-start md:self-auto">
            <div className="flex flex-col text-right">
              <span className="text-[11px] uppercase tracking-wider font-bold text-gray-200">
                {t.healthScore}
              </span>
              <span className="text-xs font-semibold text-limeAccent">
                {language === 'hi'
                  ? overallRisk === 'High risk'
                    ? 'गंभीर जोखिम'
                    : overallRisk === 'Watch'
                    ? 'निगरानी रखें'
                    : 'अनुकूल स्थिति'
                  : overallRisk}
              </span>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold shadow-soft ${
              healthScore >= 80 ? 'bg-agri text-white' : healthScore >= 60 ? 'bg-warningAmber text-white' : 'bg-criticalRed text-white'
            }`}>
              {healthScore}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Soil & Climate Condition Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title={t.soilMoisture}
          value={`${moisture}%`}
          status={moisture < 35 ? 'CRITICAL' : moisture < 42 ? 'WARNING' : 'OPTIMAL'}
          benchmark="40 - 75%"
          icon={Droplets}
          subtitle="Root Depth Hydration"
        />
        <MetricCard
          title={t.soilTemp}
          value={`${soilTemp}°C`}
          status={soilTemp > 30 ? 'WARNING' : 'OPTIMAL'}
          benchmark="15 - 26°C"
          icon={Thermometer}
          subtitle="Rhizosphere Temperature"
        />
        <MetricCard
          title={`${t.ambientTemp} / RH`}
          value={`${ambTemp}°C`}
          unit={`/ ${humidity}%`}
          status={humidity > 80 ? 'WARNING' : 'OPTIMAL'}
          benchmark="RH < 75%"
          icon={CloudRain}
          subtitle="Canopy Microclimate"
        />
        <MetricCard
          title={t.soilPh}
          value={ph}
          status={ph < 6.0 || ph > 7.8 ? 'WARNING' : 'OPTIMAL'}
          benchmark="6.2 - 7.5"
          icon={FlaskConical}
          subtitle="Nutrient Uptake pH"
        />
      </div>

      {/* Main Grid: Active Risk Alerts & Smart Agricultural Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Alerts & Explainable Rules */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-forest dark:text-darkTextPrimary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-agri" />
              <span>{t.activeAlerts}</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-green-100 dark:bg-forest text-forest dark:text-limeAccent">
                {activeAlerts.length}
              </span>
            </h2>
            <Link
              to="/crop-health"
              className="text-xs font-bold text-agri hover:text-agri-dark dark:hover:text-limeAccent flex items-center gap-1"
            >
              <span>View Rule Engine Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="bg-white dark:bg-darkCard rounded-3xl p-8 border border-gray-100 dark:border-darkBorder text-center shadow-soft">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-agri flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-forest dark:text-darkTextPrimary mb-1">
                {language === 'hi' ? 'सभी खेत पैरामीटर सुरक्षित हैं' : 'All Field Parameters Healthy'}
              </h3>
              <p className="text-xs sm:text-sm text-secondaryText dark:text-darkTextSecondary max-w-md mx-auto">
                {language === 'hi'
                  ? 'खेत की वर्तमान स्थितियां आपकी फसल की अवस्था के अनुसार आदर्श सीमाओं के भीतर हैं।'
                  : 'Current field soil and climate indicators match optimal benchmarks for this crop stage.'}
              </p>
            </div>
          ) : (
            <div>
              {activeAlerts.map(alert => (
                <AlertBanner
                  key={alert.id}
                  alert={alert}
                  onDismiss={dismissAlert}
                  onMarkRead={markAlertAsRead}
                />
              ))}
            </div>
          )}

          {/* Crop Protection Quick Advisory Card */}
          <div className="bg-white dark:bg-darkCard rounded-3xl p-6 border border-gray-100 dark:border-darkBorder shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-agri" />
                <h3 className="text-sm font-bold text-forest dark:text-darkTextPrimary">
                  Agronomic Care Notice ({crop.nameEn})
                </h3>
              </div>
              <span className="text-xs font-semibold text-agri dark:text-limeAccent">
                {selectedFarm?.growthStage}
              </span>
            </div>
            <p className="text-xs text-secondaryText dark:text-darkTextSecondary leading-relaxed">
              {crop.rotationBenefits?.[0] || 'Rotate with nitrogen-fixing pulses to maintain long-term soil structure and fertility.'}
            </p>
          </div>
        </div>

        {/* Right Col: Weather Advisory & Smart Tools */}
        <div className="space-y-6">
          {/* Weather Card */}
          <div className="bg-white dark:bg-darkCard rounded-3xl p-6 border border-gray-100 dark:border-darkBorder shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-forest dark:text-darkTextPrimary flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-agri" />
                <span>Agro-Weather Advisory</span>
              </h3>
              <Link to="/weather" className="text-xs font-semibold text-agri dark:text-limeAccent hover:underline">
                5-Day Forecast
              </Link>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-warmBg dark:bg-darkSurface mb-4">
              <div>
                <span className="text-2xl font-extrabold text-forest dark:text-darkTextPrimary">
                  {weatherData?.current?.temperature ?? 22.4}°C
                </span>
                <p className="text-xs text-secondaryText dark:text-darkTextSecondary">
                  {weatherData?.current?.condition ?? 'Partly Sunny'} • Wind: {weatherData?.current?.windSpeedKmh ?? 9} km/h
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 dark:bg-forest text-agri dark:text-limeAccent">
                Spray Safe
              </span>
            </div>

            {weatherData?.advisoryAlerts?.[0] && (
              <div className="text-xs text-gray-700 dark:text-gray-300 bg-emerald-50/60 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <strong className="text-forest dark:text-limeAccent block mb-1">
                  {language === 'hi' ? weatherData.advisoryAlerts[0].titleHi : weatherData.advisoryAlerts[0].titleEn}
                </strong>
                <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary leading-relaxed">
                  {language === 'hi' ? weatherData.advisoryAlerts[0].messageHi : weatherData.advisoryAlerts[0].messageEn}
                </p>
              </div>
            )}
          </div>

          {/* Quick Nav Tools */}
          <div className="bg-white dark:bg-darkCard rounded-3xl p-6 border border-gray-100 dark:border-darkBorder shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-forest dark:text-darkTextPrimary mb-2">Smart Agricultural Modules</h3>

            <Link
              to="/crop-advisor"
              className="flex items-center justify-between p-3 rounded-2xl bg-warmBg dark:bg-darkSurface hover:bg-green-50 dark:hover:bg-darkBorder border border-gray-100 dark:border-darkBorder transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-forest text-limeAccent flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-darkText dark:text-darkTextPrimary group-hover:text-agri">
                    AI Next-Season Advisor
                  </h4>
                  <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary">Rank crops by soil & water fit</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri" />
            </Link>

            <Link
              to="/profit-calculator"
              className="flex items-center justify-between p-3 rounded-2xl bg-warmBg dark:bg-darkSurface hover:bg-green-50 dark:hover:bg-darkBorder border border-gray-100 dark:border-darkBorder transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-forest text-limeAccent flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-darkText dark:text-darkTextPrimary group-hover:text-agri">
                    Profit & Cost Calculator
                  </h4>
                  <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary">Estimate seed, fertilizer & net return</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri" />
            </Link>

            <Link
              to="/image-analysis"
              className="flex items-center justify-between p-3 rounded-2xl bg-warmBg dark:bg-darkSurface hover:bg-green-50 dark:hover:bg-darkBorder border border-gray-100 dark:border-darkBorder transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-forest text-limeAccent flex items-center justify-center">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-darkText dark:text-darkTextPrimary group-hover:text-agri">
                    Crop Health Image Analysis
                  </h4>
                  <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary">Diagnose leaf symptoms</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri" />
            </Link>

            <Link
              to="/assistant"
              className="flex items-center justify-between p-3 rounded-2xl bg-warmBg dark:bg-darkSurface hover:bg-green-50 dark:hover:bg-darkBorder border border-gray-100 dark:border-darkBorder transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-agri text-white flex items-center justify-center">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-darkText dark:text-darkTextPrimary group-hover:text-agri">
                    AI Kisan Assistant (Chat)
                  </h4>
                  <p className="text-[11px] text-secondaryText dark:text-darkTextSecondary">Ask questions in Hindi or English</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-agri" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
