import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SensorTelemetry, RiskAlert, DemoScenario } from '../types';
import { useFarms } from './FarmContext';

interface SensorContextType {
  latestTelemetry: SensorTelemetry | null;
  history: SensorTelemetry[];
  activeAlerts: RiskAlert[];
  isSimulated: boolean;
  simulationRunning: boolean;
  activeScenario: DemoScenario;
  toggleSimulation: () => Promise<void>;
  switchScenario: (scenario: DemoScenario) => Promise<void>;
  refreshTelemetry: () => Promise<void>;
  markAlertAsRead: (alertId: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  isLoading: boolean;
}

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedFarm } = useFarms();
  const [latestTelemetry, setLatestTelemetry] = useState<SensorTelemetry | null>(null);
  const [history, setHistory] = useState<SensorTelemetry[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<RiskAlert[]>([]);
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [activeScenario, setActiveScenario] = useState<DemoScenario>('NORMAL');
  const [isLoading, setIsLoading] = useState(false);

  const farmId = selectedFarm?.id || 'farm-01';

  const fetchSensorData = useCallback(async () => {
    if (!farmId) return;
    try {
      // 1. Fetch latest telemetry
      const resLatest = await fetch(`/api/v1/sensors/latest/${farmId}`);
      if (resLatest.ok) {
        const data = await resLatest.json();
        if (data.success && data.telemetry) {
          setLatestTelemetry(data.telemetry);
        }
        if (data.simulationState) {
          setSimulationRunning(data.simulationState.isRunning);
          setActiveScenario(data.simulationState.activeScenario);
        }
      }

      // 2. Fetch history
      const resHistory = await fetch(`/api/v1/sensors/history/${farmId}?limit=40`);
      if (resHistory.ok) {
        const histData = await resHistory.json();
        if (histData.success && histData.telemetry) {
          setHistory(histData.telemetry);
        }
      }

      // 3. Fetch crop health alerts
      const resHealth = await fetch(`/api/v1/crop-health/${farmId}`);
      if (resHealth.ok) {
        const healthData = await resHealth.json();
        if (healthData.success && healthData.evaluation?.alerts) {
          setActiveAlerts(healthData.evaluation.alerts);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch sensor data:', e);
    }
  }, [farmId]);

  useEffect(() => {
    fetchSensorData();
    // Poll telemetry every 10 seconds for real-time dashboard updates
    const interval = setInterval(fetchSensorData, 10000);
    return () => clearInterval(interval);
  }, [fetchSensorData]);

  const toggleSimulation = async () => {
    try {
      const res = await fetch('/api/v1/sensors/simulation/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRunning: !simulationRunning }),
      });
      const data = await res.json();
      if (data.success) {
        setSimulationRunning(data.isRunning);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const switchScenario = async (scenario: DemoScenario) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/sensors/simulation/scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveScenario(scenario);
        // Immediately fetch updated scenario data
        await fetchSensorData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    try {
      await fetch(`/api/v1/crop-health/alerts/${alertId}/read`, { method: 'POST' });
      setActiveAlerts(prev => prev.map(a => (a.id === alertId ? { ...a, isRead: true } : a)));
    } catch (e) {
      console.error(e);
    }
  };

  const dismissAlert = async (alertId: string) => {
    try {
      await fetch(`/api/v1/crop-health/alerts/${alertId}`, { method: 'DELETE' });
      setActiveAlerts(prev => prev.filter(a => a.id !== alertId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SensorContext.Provider
      value={{
        latestTelemetry,
        history,
        activeAlerts,
        isSimulated: latestTelemetry ? latestTelemetry.isSimulated : true,
        simulationRunning,
        activeScenario,
        toggleSimulation,
        switchScenario,
        refreshTelemetry: fetchSensorData,
        markAlertAsRead,
        dismissAlert,
        isLoading,
      }}
    >
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (!context) throw new Error('useSensors must be used within a SensorProvider');
  return context;
};

