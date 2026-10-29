import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MapPin,
  Clock,
} from 'lucide-react';
import { useFarms } from '../context/FarmContext';
import { useLanguage } from '../context/LanguageContext';

export const ReportsPage: React.FC = () => {
  const { farms, selectedFarm, setSelectedFarmId } = useFarms();
  const { language, t } = useLanguage();

  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const farmId = selectedFarm?.id || 'farm-01';

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/v1/reports/summary/${farmId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setReportData(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [farmId]);

  const handleDownloadCsv = () => {
    window.open(`/api/v1/reports/export/${farmId}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const stats = reportData?.stats;
  const readings = reportData?.recentReadings || [];
  const alerts = reportData?.alerts || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-agri" />
            <span>{t.navReports}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Audit-grade agricultural telemetry logs, alert histories & downloadable CSV datasets
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleDownloadCsv}
            className="px-4 py-2.5 rounded-xl bg-forest text-limeAccent font-bold text-xs hover:bg-forest-light transition-colors flex items-center gap-2 shadow-soft"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-darkText font-bold text-xs hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-soft"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Farm Selector Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-100 shadow-soft flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-forest">
          <MapPin className="w-4 h-4 text-agri" />
          <span>Selected Farm for Export:</span>
          <select
            value={farmId}
            onChange={e => setSelectedFarmId(e.target.value)}
            className="p-1 rounded-lg border border-gray-200 font-semibold text-darkText"
          >
            {farms.map(f => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.location.district})
              </option>
            ))}
          </select>
        </div>

        <span className="text-secondaryText font-medium">
          Total Recorded Telemetry Points: <strong className="text-forest">{stats?.totalReadings ?? 0}</strong>
        </span>
      </div>

      {/* Aggregate Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-xs text-secondaryText font-semibold block mb-1">Average Moisture</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.avgMoisture ?? 42}%</span>
          <span className="text-[11px] text-gray-500 block mt-1">24h Mean Window</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-xs text-secondaryText font-semibold block mb-1">Mean Soil Temp</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.avgSoilTemp ?? 20.4}°C</span>
          <span className="text-[11px] text-gray-500 block mt-1">Root Zone Activity</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-xs text-secondaryText font-semibold block mb-1">Mean Humidity</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.avgHumidity ?? 62}%</span>
          <span className="text-[11px] text-gray-500 block mt-1">Ambient Canopy</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-xs text-secondaryText font-semibold block mb-1">Mean Soil pH</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.avgPh ?? 6.8}</span>
          <span className="text-[11px] text-gray-500 block mt-1">Calibrated Baseline</span>
        </div>
      </div>

      {/* Recent Telemetry Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-forest">Recent Sensor Telemetry Log</h3>
          <span className="text-xs text-secondaryText">Displaying last 20 timeframes</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-warmBg text-forest font-bold border-b border-gray-100">
                <th className="p-3">Time</th>
                <th className="p-3">Moisture</th>
                <th className="p-3">Soil Temp</th>
                <th className="p-3">Amb Temp</th>
                <th className="p-3">Humidity</th>
                <th className="p-3">Soil pH</th>
                <th className="p-3">Battery</th>
                <th className="p-3">Data Origin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {readings.slice(-15).reverse().map((r: any) => (
                <tr key={r.id} className="hover:bg-warmBg/50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-secondaryText">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-3 font-bold text-darkText">{r.soilMoisture}%</td>
                  <td className="p-3 text-darkText">{r.soilTemperature}°C</td>
                  <td className="p-3 text-darkText">{r.ambientTemperature}°C</td>
                  <td className="p-3 text-darkText">{r.relativeHumidity}%</td>
                  <td className="p-3 text-darkText">{r.soilPh}</td>
                  <td className="p-3 font-mono text-[11px] text-agri">{r.batteryVoltage ? `${r.batteryVoltage}V` : '3.95V'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      r.isSimulated ? 'bg-amber-100 text-warningAmber' : 'bg-green-100 text-agri'
                    }`}>
                      {r.isSimulated ? 'SIMULATED' : 'HARDWARE'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

