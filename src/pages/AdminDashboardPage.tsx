import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Sprout,
  Cpu,
  AlertTriangle,
  Activity,
  Sliders,
  History,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { CROPS_DATABASE } from '../../server/data/cropsData';

export const AdminDashboardPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [stats, setStats] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [selectedCropId, setSelectedCropId] = useState('wheat');
  const [selectedStage, setSelectedStage] = useState('Flowering / Boot Stage (70-80 DAS)');

  const [minMoisture, setMinMoisture] = useState<number>(50);
  const [maxMoisture, setMaxMoisture] = useState<number>(75);
  const [waterStressAlert, setWaterStressAlert] = useState<number>(38);
  const [updateMsg, setUpdateMsg] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setAuditLogs(data.recentAuditLogs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const selectedCrop = CROPS_DATABASE.find(c => c.id === selectedCropId);

  useEffect(() => {
    if (selectedCrop && selectedCrop.stageThresholds[selectedStage]) {
      const stg = selectedCrop.stageThresholds[selectedStage];
      setMinMoisture(stg.minMoisture);
      setMaxMoisture(stg.maxMoisture);
      setWaterStressAlert(stg.waterStressAlert);
    }
  }, [selectedCropId, selectedStage]);

  const handleUpdateThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/admin/thresholds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId: selectedCropId,
          growthStage: selectedStage,
          minMoisture,
          maxMoisture,
          waterStressAlert,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUpdateMsg(data.message);
        fetchStats();
        setTimeout(() => setUpdateMsg(''), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-agri" />
            <span>{t.navAdmin}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Platform governance, telemetry stream health, rule threshold tuning & audit trails
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="p-2.5 rounded-xl bg-forest text-limeAccent font-bold hover:bg-forest-light transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Registered Users</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.totalUsers ?? 2}</span>
          <span className="text-[10px] text-agri font-bold block mt-1">Farmers & Admins</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Total Plots / Farms</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.totalFarms ?? 3}</span>
          <span className="text-[10px] text-gray-500 font-bold block mt-1">Multi-Crop Holdings</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">IoT Nodes</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.totalDevices ?? 3}</span>
          <span className="text-[10px] text-agri font-bold block mt-1">{stats?.onlineDevices ?? 2} Online</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Telemetry Readings</span>
          <span className="text-2xl font-extrabold text-forest">{stats?.totalTelemetryReadings ?? 72}</span>
          <span className="text-[10px] text-gray-500 font-bold block mt-1">In Memory & Disk</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Invalid Packets</span>
          <span className="text-2xl font-extrabold text-criticalRed">{stats?.totalInvalidPackets ?? 2}</span>
          <span className="text-[10px] text-gray-500 font-bold block mt-1">Rejected by Gateway</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-soft">
          <span className="text-[11px] font-semibold text-secondaryText block mb-1">Active Alerts</span>
          <span className="text-2xl font-extrabold text-warningAmber">{stats?.activeAlertsCount ?? 1}</span>
          <span className="text-[10px] text-gray-500 font-bold block mt-1">Field Interventions</span>
        </div>
      </div>

      {/* Threshold Configuration Editor */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-forest flex items-center gap-2">
              <Sliders className="w-5 h-5 text-agri" />
              <span>Agronomic Rule Threshold Tuning</span>
            </h3>
            <p className="text-xs text-secondaryText">
              Adjust safe physiological thresholds by crop and growth stage without code changes
            </p>
          </div>
          {updateMsg && (
            <span className="text-xs font-bold text-agri flex items-center gap-1 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              {updateMsg}
            </span>
          )}
        </div>

        <form onSubmit={handleUpdateThresholds} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-darkText mb-1">Select Crop</label>
              <select
                value={selectedCropId}
                onChange={e => setSelectedCropId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
              >
                {CROPS_DATABASE.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({c.nameHi})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-darkText mb-1">Growth Stage</label>
              <select
                value={selectedStage}
                onChange={e => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
              >
                {selectedCrop &&
                  Object.keys(selectedCrop.stageThresholds).map((stg, i) => (
                    <option key={i} value={stg}>
                      {stg}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-darkText mb-1">Optimal Minimum Moisture (%)</label>
              <input
                type="number"
                value={minMoisture}
                onChange={e => setMinMoisture(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-darkText mb-1">Optimal Maximum Moisture (%)</label>
              <input
                type="number"
                value={maxMoisture}
                onChange={e => setMaxMoisture(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-darkText mb-1">Water Stress Alert Below (%)</label>
              <input
                type="number"
                value={waterStressAlert}
                onChange={e => setWaterStressAlert(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-forest text-limeAccent font-bold text-xs hover:bg-forest-light transition-colors shadow-soft"
            >
              Save Threshold Configuration
            </button>
          </div>
        </form>
      </div>

      {/* System Audit Trail */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft">
        <h3 className="text-base font-bold text-forest mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-agri" />
          <span>System Audit Trail & Security Events</span>
        </h3>

        <div className="space-y-2 text-xs">
          {auditLogs.map(log => (
            <div
              key={log.id}
              className="p-3 rounded-2xl bg-warmBg border border-gray-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <span className="font-bold text-forest">{log.action}: </span>
                <span className="text-darkText">{log.details}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-secondaryText flex-shrink-0">
                <span>By: <strong>{log.actor}</strong></span>
                <span>•</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

