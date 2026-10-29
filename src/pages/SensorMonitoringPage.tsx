import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Activity,
  Droplets,
  Thermometer,
  CloudRain,
  FlaskConical,
  Radio,
  Cpu,
  Sparkles,
  RefreshCw,
  Terminal,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Battery,
  Zap,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useSensors } from '../context/SensorContext';
import { useLanguage } from '../context/LanguageContext';
import { MetricCard } from '../components/common/MetricCard';
import { DemoScenario } from '../types';

export const SensorMonitoringPage: React.FC = () => {
  const { selectedFarm } = useFarms();
  const {
    latestTelemetry,
    history,
    isSimulated,
    simulationRunning,
    activeScenario,
    toggleSimulation,
    switchScenario,
    refreshTelemetry,
    isLoading,
  } = useSensors();
  const { language, t } = useLanguage();

  const [timeRange, setTimeRange] = useState<'6h' | '24h' | 'all'>('24h');
  const [showApiModal, setShowApiModal] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  const farmId = selectedFarm?.id || 'farm-01';

  // Format chart time labels
  const chartData = history.map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    soilMoisture: item.soilMoisture,
    soilTemp: item.soilTemperature,
    ambientTemp: item.ambientTemperature,
    relativeHumidity: item.relativeHumidity,
    soilPh: item.soilPh,
  }));

  const sampleCurl = `curl -X POST http://localhost:5000/api/v1/sensors/ingest \\
  -H "Content-Type: application/json" \\
  -H "X-Device-Token: kr_live_token_karnal_01" \\
  -d '{
    "deviceId": "ESP32-KR-001",
    "soilMoisture": 44.5,
    "soilTemperature": 20.8,
    "ambientTemperature": 23.1,
    "relativeHumidity": 61.5,
    "soilPh": 6.82,
    "batteryVoltage": 3.96
  }'`;

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <Activity className="w-7 h-7 text-agri" />
            <span>{t.navSensors}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Continuous multi-depth soil telemetry & microclimate sensor array
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowApiModal(true)}
            className="px-3.5 py-2 rounded-xl bg-warmBg border border-gray-200 text-xs font-bold text-forest hover:bg-gray-100 flex items-center gap-1.5 transition-colors"
          >
            <Terminal className="w-4 h-4 text-agri" />
            <span>Live Hardware API</span>
          </button>

          <button
            onClick={() => refreshTelemetry()}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-forest text-limeAccent font-bold hover:bg-forest-light transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Simulation Controls & Scenario Selector */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`w-3.5 h-3.5 rounded-full ${simulationRunning ? 'bg-agri animate-pulse' : 'bg-gray-400'}`} />
            <div>
              <span className="text-xs font-bold text-forest uppercase tracking-wider block">
                {isSimulated ? 'Sensor Simulation Controller' : 'Live Hardware Controller'}
              </span>
              <span className="text-[11px] text-secondaryText">
                Active Scenario: <strong className="text-forest capitalize">{activeScenario.replace('_', ' ')}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulation}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                simulationRunning
                  ? 'bg-amber-100 text-warningAmber hover:bg-amber-200'
                  : 'bg-green-100 text-agri hover:bg-green-200'
              }`}
            >
              {simulationRunning ? 'Pause Simulation' : 'Start Simulation'}
            </button>
          </div>
        </div>

        {/* 5 Hackathon Scenarios Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4 text-xs font-semibold">
          {[
            { id: 'SCENARIO_A', label: 'Scenario A', desc: 'Water Stress' },
            { id: 'SCENARIO_B', label: 'Scenario B', desc: 'Fungal Risk' },
            { id: 'SCENARIO_C', label: 'Scenario C', desc: 'Next Season' },
            { id: 'SCENARIO_D', label: 'Scenario D', desc: 'Economics' },
            { id: 'SCENARIO_E', label: 'Scenario E', desc: 'Node Offline' },
            { id: 'NORMAL', label: 'Normal', desc: 'Oscillating' },
          ].map(sc => (
            <button
              key={sc.id}
              onClick={() => switchScenario(sc.id as DemoScenario)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                activeScenario === sc.id
                  ? 'bg-forest text-limeAccent border-forest shadow-soft'
                  : 'bg-warmBg text-darkText border-gray-200 hover:bg-green-50'
              }`}
            >
              <div className="font-bold text-[11px] truncate">{sc.label}</div>
              <div className="text-[10px] text-secondaryText truncate">{sc.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Current Sensor Readings */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Soil Moisture</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-forest">{latestTelemetry?.soilMoisture ?? 42}%</span>
          </div>
          <span className="text-[10px] text-agri font-bold block mt-1">Target: 40-75%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Soil Temp</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-forest">{latestTelemetry?.soilTemperature ?? 20.4}°C</span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium block mt-1">Root Activity Ideal</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Ambient Temp</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-forest">{latestTelemetry?.ambientTemperature ?? 22.8}°C</span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium block mt-1">Canopy SHT31</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Relative Humidity</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-forest">{latestTelemetry?.relativeHumidity ?? 62}%</span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium block mt-1">Threshold: &lt;80%</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Soil pH</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-extrabold text-forest">{latestTelemetry?.soilPh ?? 6.8}</span>
          </div>
          <span className="text-[10px] text-gray-500 font-medium block mt-1">Neutral Range</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Device Battery</span>
          <div className="flex items-baseline gap-1 text-agri">
            <Battery className="w-4 h-4" />
            <span className="text-xl font-extrabold text-forest">
              {latestTelemetry?.batteryVoltage ? `${latestTelemetry.batteryVoltage}V` : '3.95V'}
            </span>
          </div>
          <span className="text-[10px] text-agri font-bold block mt-1">94% Charged</span>
        </div>
      </div>

      {/* Time-Series Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Moisture Chart */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-forest flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-agri" />
                <span>Soil Moisture Trend (%)</span>
              </h3>
              <p className="text-[11px] text-secondaryText">Diurnal oscillation & irrigation threshold</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-forest">
              Active Zone: 40-75%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis domain={[10, 90]} stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="soilMoisture"
                  name="Soil Moisture (%)"
                  stroke="#25834B"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temperature & Humidity Dynamics */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-forest flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-warningAmber" />
                <span>Temperature (°C) & Humidity (%) Dynamics</span>
              </h3>
              <p className="text-[11px] text-secondaryText">Soil vs Ambient vs Canopy RH</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="ambientTemp"
                  name="Ambient Temp (°C)"
                  stroke="#E9A23B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="soilTemp"
                  name="Soil Temp (°C)"
                  stroke="#163D2B"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="relativeHumidity"
                  name="Humidity (%)"
                  stroke="#3B82F6"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Hardware API Ingestion Modal */}
      {showApiModal && (
        <div className="fixed inset-0 z-50 bg-forest/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-elevated animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-6 h-6 text-agri" />
                <div>
                  <h3 className="font-bold text-base text-forest">Live Hardware Ingestion Contract</h3>
                  <p className="text-xs text-secondaryText">ESP32 / Arduino WiFi & LoRa Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-darkText font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div>
                <span className="font-bold text-darkText block mb-1">Ingestion Endpoint:</span>
                <code className="px-3 py-1.5 rounded-lg bg-warmBg border border-gray-200 font-mono text-agri block">
                  POST http://localhost:5000/api/v1/sensors/ingest
                </code>
              </div>

              <div>
                <span className="font-bold text-darkText block mb-1">Authentication Token:</span>
                <code className="px-3 py-1.5 rounded-lg bg-warmBg border border-gray-200 font-mono text-forest block">
                  X-Device-Token: kr_live_token_karnal_01
                </code>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-darkText">Sample Ingestion cURL:</span>
                  <button
                    onClick={handleCopyCurl}
                    className="text-agri font-bold hover:underline flex items-center gap-1"
                  >
                    {copiedCurl ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCurl ? 'Copied!' : 'Copy cURL'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-2xl bg-forest text-limeAccent font-mono text-[11px] overflow-x-auto leading-relaxed">
                  {sampleCurl}
                </pre>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-900 text-[11px]">
                <strong>Validation Protocol:</strong> The endpoint checks numeric bounds (Moisture 0-100%, Ambient -20 to 65°C, pH 2.0-12.0) and instantly rejects corrupt payloads. Successful packets immediately trigger the Crop-Risk Rules Engine.
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-gray-100">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-5 py-2 rounded-xl bg-forest text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

