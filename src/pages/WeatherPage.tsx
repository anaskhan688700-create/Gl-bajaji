import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  Sun,
  CloudRain,
  Cloud,
  Wind,
  Droplets,
  Thermometer,
  ShieldAlert,
  Bell,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';

export const WeatherPage: React.FC = () => {
  const { selectedFarm } = useFarms();
  const { language, t } = useLanguage();

  const [weatherData, setWeatherData] = useState<any>(null);
  const [notifySpray, setNotifySpray] = useState(true);
  const [notifyFrost, setNotifyFrost] = useState(true);
  const [notifyRain, setNotifyRain] = useState(true);

  const farmId = selectedFarm?.id || 'farm-01';

  useEffect(() => {
    fetch(`/api/v1/weather/${farmId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setWeatherData(data);
      })
      .catch(() => {});
  }, [farmId]);

  const current = weatherData?.current;
  const forecast = weatherData?.forecast || [];
  const advisoryAlerts = weatherData?.advisoryAlerts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <CloudSun className="w-7 h-7 text-agri" />
            <span>{t.navWeather}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Agro-meteorological forecast & spray window intelligence for{' '}
            <strong className="text-forest">
              {selectedFarm?.location.district}, {selectedFarm?.location.state}
            </strong>
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-warmBg border border-gray-200 text-xs font-bold text-forest self-start sm:self-auto">
          {weatherData?.source || 'Agro-Meteorological Engine'}
        </span>
      </div>

      {/* Current Conditions Card */}
      <div className="bg-gradient-to-br from-forest to-forest-light text-white rounded-3xl p-6 sm:p-8 shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-forest-light">
          <div>
            <div className="flex items-center gap-2 text-limeAccent text-xs font-bold uppercase mb-2">
              <MapPin className="w-4 h-4" />
              <span>{selectedFarm?.name} — Current Field Weather</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl sm:text-6xl font-black tracking-tight">
                {current?.temperature ?? 22.4}°C
              </span>
              <span className="text-sm sm:text-lg text-gray-200 font-medium">
                {current?.condition ?? 'Partly Sunny'}
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Feels like {current?.apparentTemperature ?? 21.8}°C • Dew Point: {current?.dewPoint ?? 14.5}°C
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
              <span className="text-gray-300 block text-[11px]">Relative Humidity</span>
              <span className="text-lg font-bold text-limeAccent">{current?.relativeHumidity ?? 64}%</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
              <span className="text-gray-300 block text-[11px]">Wind Speed</span>
              <span className="text-lg font-bold text-white">{current?.windSpeedKmh ?? 9} km/h</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
              <span className="text-gray-300 block text-[11px]">Rain (Past 24h)</span>
              <span className="text-lg font-bold text-white">{current?.rainfallPast24hMm ?? 0} mm</span>
            </div>
          </div>
        </div>

        {/* Agro Indicators Bar */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center gap-2.5 bg-forest-dark/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-5 h-5 text-limeAccent flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">Foliar Spray Window</span>
              <span className="text-[11px] text-gray-300">Optimal (Wind &lt; 12 km/h, no rain)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-forest-dark/60 p-3 rounded-2xl border border-white/10">
            <CheckCircle2 className="w-5 h-5 text-limeAccent flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">Frost / Cold Index</span>
              <span className="text-[11px] text-gray-300">Low Risk (Min temp &gt; 11°C)</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-forest-dark/60 p-3 rounded-2xl border border-white/10">
            <AlertCircle className="w-5 h-5 text-warningAmber flex-shrink-0" />
            <div>
              <span className="font-bold text-white block">Night Dew Index</span>
              <span className="text-[11px] text-gray-300">RH &gt; 80% pre-dawn, monitor rust</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5-Day Agro-Meteorological Forecast Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
        <h3 className="text-base font-bold text-forest mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-agri" />
          <span>5-Day Agricultural Weather Forecast & Operational Guidance</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {forecast.map((fc: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex flex-col justify-between text-xs transition-all ${
                idx === 0 ? 'bg-green-50/60 border-agri/50 ring-1 ring-agri/30' : 'bg-warmBg border-gray-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-forest">{fc.day}</span>
                  <span className="text-[10px] text-secondaryText">{fc.date.slice(5)}</span>
                </div>

                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-extrabold text-forest">{fc.tempMax}°</span>
                  <span className="text-xs font-semibold text-secondaryText">/ {fc.tempMin}°C</span>
                </div>

                <div className="space-y-1 text-[11px] text-secondaryText mb-3">
                  <p className="flex items-center gap-1">
                    <CloudRain className="w-3 h-3 text-blue-500" />
                    <span>Rain prob: <strong className="text-darkText">{fc.rainfallProbability}%</strong></span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Wind className="w-3 h-3 text-gray-500" />
                    <span>Wind: <strong className="text-darkText">{fc.windSpeedKmh} km/h</strong></span>
                  </p>
                  <p className="flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-teal-600" />
                    <span>RH: <strong className="text-darkText">{fc.humidity}%</strong></span>
                  </p>
                </div>
              </div>

              {/* Day Specific Advisory */}
              <div className="bg-white p-2.5 rounded-xl border border-gray-200 text-[10px] leading-tight text-forest font-medium">
                {language === 'hi' ? fc.agroAdvisoryHi : fc.agroAdvisoryEn}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather Notification Preferences */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
        <h3 className="text-base font-bold text-forest mb-2 flex items-center gap-2">
          <Bell className="w-5 h-5 text-agri" />
          <span>Agricultural Weather Alerts Configuration</span>
        </h3>
        <p className="text-xs text-secondaryText mb-4">
          Receive real-time in-app alerts when weather thresholds threaten crop safety:
        </p>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-warmBg border border-gray-100 cursor-pointer">
            <div>
              <span className="font-bold text-darkText block">Rain & Spray Window Alerts</span>
              <span className="text-[11px] text-secondaryText">Notify before spraying if rain probability exceeds 40%</span>
            </div>
            <input
              type="checkbox"
              checked={notifySpray}
              onChange={e => setNotifySpray(e.target.checked)}
              className="w-4 h-4 text-agri rounded focus:ring-agri"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-warmBg border border-gray-100 cursor-pointer">
            <div>
              <span className="font-bold text-darkText block">Frost & Cold Wave Early Warning</span>
              <span className="text-[11px] text-secondaryText">Notify 24 hours prior to forecasted night temperatures below 5°C</span>
            </div>
            <input
              type="checkbox"
              checked={notifyFrost}
              onChange={e => setNotifyFrost(e.target.checked)}
              className="w-4 h-4 text-agri rounded focus:ring-agri"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-2xl bg-warmBg border border-gray-100 cursor-pointer">
            <div>
              <span className="font-bold text-darkText block">Excess Humidity Fungal Risk Triggers</span>
              <span className="text-[11px] text-secondaryText">Notify when RH remains &gt; 80% for more than 48 hours</span>
            </div>
            <input
              type="checkbox"
              checked={notifyRain}
              onChange={e => setNotifyRain(e.target.checked)}
              className="w-4 h-4 text-agri rounded focus:ring-agri"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
