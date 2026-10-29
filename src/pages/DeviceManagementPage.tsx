import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Plus,
  Radio,
  CheckCircle2,
  AlertTriangle,
  Battery,
  Terminal,
  Code2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Device } from '../types';

export const DeviceManagementPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [devices, setDevices] = useState<Device[]>([]);
  const [firmwareSpec, setFirmwareSpec] = useState<any>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Registration Form
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [hardwareModel, setHardwareModel] = useState('ESP32-WROOM-32D Agri Pro');

  // Test Ingestion Sandbox
  const [sandboxMoisture, setSandboxMoisture] = useState('45.2');
  const [sandboxTemp, setSandboxTemp] = useState('21.5');
  const [sandboxHumidity, setSandboxHumidity] = useState('60.0');
  const [sandboxResponse, setSandboxResponse] = useState<any>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/v1/devices');
      const data = await res.json();
      if (data.success && data.devices) {
        setDevices(data.devices);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFirmwareSpec = async () => {
    try {
      const res = await fetch('/api/v1/devices/firmware/spec');
      const data = await res.json();
      if (data.success) {
        setFirmwareSpec(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchDevices();
    fetchFirmwareSpec();
  }, []);

  const handleRegisterDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newDeviceId,
          name: newDeviceName,
          hardwareModel,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowRegisterModal(false);
        fetchDevices();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendSandboxPacket = async () => {
    setIsSendingTest(true);
    setSandboxResponse(null);
    try {
      const res = await fetch('/api/v1/sensors/ingest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-Token': 'kr_live_token_karnal_01',
        },
        body: JSON.stringify({
          deviceId: 'ESP32-KR-001',
          soilMoisture: parseFloat(sandboxMoisture),
          soilTemperature: parseFloat(sandboxTemp) - 1.5,
          ambientTemperature: parseFloat(sandboxTemp),
          relativeHumidity: parseFloat(sandboxHumidity),
          soilPh: 6.85,
          batteryVoltage: 3.96,
        }),
      });
      const data = await res.json();
      setSandboxResponse(data);
    } catch (e: any) {
      setSandboxResponse({ success: false, error: e.message });
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-forest flex items-center gap-2">
            <Cpu className="w-7 h-7 text-agri" />
            <span>{t.navDevices}</span>
          </h1>
          <p className="text-xs sm:text-sm text-secondaryText">
            Hardware node registry, authentication tokens, invalid packet diagnostics & ESP32 firmware
          </p>
        </div>

        <button
          onClick={() => {
            setNewDeviceId(`ESP32-KR-00${devices.length + 1}`);
            setNewDeviceName(`Field Node #${devices.length + 1}`);
            setShowRegisterModal(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-forest text-limeAccent font-bold text-xs hover:bg-forest-light transition-colors flex items-center gap-2 shadow-soft self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New IoT Node</span>
        </button>
      </div>

      {/* Devices List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {devices.map(dev => (
          <div
            key={dev.id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-soft space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-agri">{dev.id}</span>
                <h3 className="font-bold text-base text-forest mt-0.5">{dev.name}</h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                dev.status === 'ONLINE' ? 'bg-green-100 text-agri' : 'bg-red-100 text-criticalRed'
              }`}>
                {dev.status}
              </span>
            </div>

            <div className="space-y-2 py-3 border-y border-gray-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-secondaryText">Hardware Model:</span>
                <span className="font-semibold text-darkText truncate max-w-[150px]">{dev.hardwareModel}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-secondaryText">Battery Level:</span>
                <span className="font-bold text-forest flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-agri" />
                  {dev.batteryPercentage}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-secondaryText">Firmware Version:</span>
                <span className="font-mono text-[11px] text-darkText">{dev.firmwareVersion}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-secondaryText">Invalid Packets Logged:</span>
                <span className={`font-bold ${dev.invalidPayloadCount > 0 ? 'text-criticalRed' : 'text-agri'}`}>
                  {dev.invalidPayloadCount}
                </span>
              </div>
            </div>

            <div className="text-[11px] bg-warmBg p-2.5 rounded-xl border border-gray-200 font-mono break-all text-secondaryText">
              Token: <strong className="text-forest">{dev.token}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Ingestion Sandbox for Hackathon Judges */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-base text-forest flex items-center gap-2">
              <Terminal className="w-5 h-5 text-agri" />
              <span>Interactive Hardware Payload Sandbox (लाइव टेस्ट सैंडबॉक्स)</span>
            </h3>
            <p className="text-xs text-secondaryText">
              Simulate an authenticated HTTP POST packet from field hardware directly into the backend
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-green-50 text-agri">
            Live Validation Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-bold text-darkText mb-1">Soil Moisture (%)</label>
            <input
              type="number"
              step="0.5"
              value={sandboxMoisture}
              onChange={e => setSandboxMoisture(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-darkText mb-1">Ambient Temp (°C)</label>
            <input
              type="number"
              step="0.5"
              value={sandboxTemp}
              onChange={e => setSandboxTemp(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-darkText mb-1">Humidity (%)</label>
            <input
              type="number"
              step="1"
              value={sandboxHumidity}
              onChange={e => setSandboxHumidity(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSendSandboxPacket}
            disabled={isSendingTest}
            className="px-5 py-2.5 rounded-xl bg-forest text-limeAccent font-bold text-xs hover:bg-forest-light transition-colors flex items-center gap-2 shadow-soft"
          >
            <Zap className="w-4 h-4" />
            <span>{isSendingTest ? 'Sending Packet...' : 'Transmit Test Telemetry Packet'}</span>
          </button>
        </div>

        {sandboxResponse && (
          <div className="mt-4 p-4 rounded-2xl bg-warmBg border border-gray-200 text-xs font-mono">
            <span className="font-bold text-forest block mb-1">Backend API Response:</span>
            <pre className="text-forest text-[11px] overflow-x-auto">
              {JSON.stringify(sandboxResponse, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* ESP32 Arduino C++ Firmware Specification */}
      {firmwareSpec && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-base text-forest flex items-center gap-2">
                <Code2 className="w-5 h-5 text-agri" />
                <span>ESP32 Arduino Firmware Source & Pinout Schema</span>
              </h3>
              <p className="text-xs text-secondaryText">
                Production-grade low-power firmware with WiFi/4G HTTP POST and deep sleep timer
              </p>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(firmwareSpec.sampleArduinoCode);
                setCopiedCode(true);
                setTimeout(() => setCopiedCode(false), 2000);
              }}
              className="text-xs font-bold text-agri hover:underline flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              <span>{copiedCode ? 'Copied Code!' : 'Copy Arduino Code'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-forest text-limeAccent font-mono text-xs overflow-x-auto leading-relaxed max-h-80">
            {firmwareSpec.sampleArduinoCode}
          </pre>
        </div>
      )}

      {/* Register Node Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-forest/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-elevated">
            <h3 className="text-lg font-bold text-forest mb-4">Register IoT Sensor Node</h3>

            <form onSubmit={handleRegisterDevice} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-darkText mb-1">Device ID</label>
                <input
                  type="text"
                  required
                  value={newDeviceId}
                  onChange={e => setNewDeviceId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-darkText mb-1">Device Name / Label</label>
                <input
                  type="text"
                  required
                  value={newDeviceName}
                  onChange={e => setNewDeviceName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-darkText mb-1">Hardware Microcontroller</label>
                <select
                  value={hardwareModel}
                  onChange={e => setHardwareModel(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:ring-2 focus:ring-agri focus:outline-none"
                >
                  <option value="ESP32-WROOM-32D Agri Pro">ESP32-WROOM-32D Agri Pro</option>
                  <option value="ESP32-S3 Agricultural LoRa/WiFi">ESP32-S3 Agricultural LoRa/WiFi</option>
                  <option value="Arduino MKR NB 1500 (Cellular)">Arduino MKR NB 1500 (Cellular)</option>
                  <option value="Raspberry Pi Zero 2 W Field Hub">Raspberry Pi Zero 2 W Field Hub</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-gray-600"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-forest text-limeAccent font-bold hover:bg-forest-light"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

