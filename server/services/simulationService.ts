import { storage, SensorTelemetry, DeviceRecord } from './storage';
import { CropRulesEngine } from './rulesEngine';

export type DemoScenario = 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'SCENARIO_D' | 'SCENARIO_E' | 'NORMAL';

export class SimulationService {
  private static instance: SimulationService;
  private intervalTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.startBackgroundTick();
  }

  public static getInstance(): SimulationService {
    if (!SimulationService.instance) {
      SimulationService.instance = new SimulationService();
    }
    return SimulationService.instance;
  }

  public setScenario(scenario: DemoScenario): void {
    storage.setSimulationState({ activeScenario: scenario });
    storage.addAuditLog('Demo Operator', 'SCENARIO_SWITCH', `Switched simulation scenario to: ${scenario}`);
    // Immediately tick to produce current scenario readings
    this.tickSimulation();
  }

  public setRunning(running: boolean): void {
    storage.setSimulationState({ isRunning: running });
    storage.addAuditLog('Demo Operator', running ? 'SIMULATION_START' : 'SIMULATION_STOP', `Simulation state set to: ${running ? 'Running' : 'Stopped'}`);
  }

  private startBackgroundTick(): void {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    // Tick every 15 seconds to update simulated data
    this.intervalTimer = setInterval(() => {
      const state = storage.getSimulationState();
      if (state.isRunning) {
        this.tickSimulation();
      }
    }, 15000);
  }

  public tickSimulation(): void {
    const state = storage.getSimulationState();
    const farms = storage.getFarms();
    const nowIso = new Date().toISOString();

    for (const farm of farms) {
      const deviceId = farm.assignedDeviceId || 'ESP32-KR-001';
      const device = storage.getDeviceById(deviceId);

      // Handle Scenario E: Device Offline
      if (state.activeScenario === 'SCENARIO_E' && farm.id === 'farm-01') {
        if (device) {
          storage.updateDevice(deviceId, {
            status: 'OFFLINE',
            lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            batteryPercentage: 8,
          });
        }
        // Do not add fresh telemetry for this device
        continue;
      } else {
        // Ensure device is online if not Scenario E
        if (device && device.status === 'OFFLINE' && deviceId === 'ESP32-KR-001') {
          storage.updateDevice(deviceId, {
            status: 'ONLINE',
            lastSeen: nowIso,
            batteryPercentage: 92,
          });
        }
      }

      // Generate readings based on active scenario
      let soilMoisture = 42;
      let soilTemp = 20.5;
      let ambTemp = 22.0;
      let humidity = 62;
      let soilPh = 6.8;
      let leafWetness = 15;
      let rainfallMm = 0;
      let dataQuality: SensorTelemetry['dataQuality'] = 'High';

      if (state.activeScenario === 'SCENARIO_A' && farm.id === 'farm-01') {
        // Scenario A: Water Stress Warning (Critically low moisture)
        soilMoisture = 22.4; // Well below safe 38-50% threshold for wheat booting
        soilTemp = 25.8;
        ambTemp = 29.2;
        humidity = 34;
        leafWetness = 0;
      } else if (state.activeScenario === 'SCENARIO_B' && farm.id === 'farm-01') {
        // Scenario B: Environmental Risk (High Humidity + Warm Dew = Disease Risk)
        soilMoisture = 55.0;
        soilTemp = 18.2;
        ambTemp = 19.5;
        humidity = 88; // Favorable for rust / fungal spore germination
        leafWetness = 82;
        rainfallMm = 4.2;
      } else {
        // NORMAL / SCENARIO C / D: Oscillate smoothly
        const jitter = (Math.random() - 0.5) * 1.5;
        const currentHour = new Date().getHours();
        const diurnal = Math.sin(((currentHour - 8) / 24) * 2 * Math.PI) * 4;

        if (farm.id === 'farm-01') {
          // Wheat farm normal
          soilMoisture = Math.round((52 + jitter) * 10) / 10;
          soilTemp = Math.round((19 + diurnal * 0.4) * 10) / 10;
          ambTemp = Math.round((22 + diurnal + jitter) * 10) / 10;
          humidity = Math.round((60 - diurnal * 2) * 10) / 10;
          soilPh = 6.9;
          leafWetness = currentHour < 7 ? 65 : 10;
        } else if (farm.id === 'farm-02') {
          // Tomato farm
          soilMoisture = Math.round((58 + jitter) * 10) / 10;
          soilTemp = Math.round((22 + diurnal * 0.5) * 10) / 10;
          ambTemp = Math.round((26 + diurnal + jitter) * 10) / 10;
          humidity = Math.round((55 - diurnal * 2) * 10) / 10;
          soilPh = 6.6;
          leafWetness = 8;
        } else {
          // Mustard farm
          soilMoisture = Math.round((39 + jitter) * 10) / 10;
          soilTemp = Math.round((18 + diurnal * 0.3) * 10) / 10;
          ambTemp = Math.round((20 + diurnal) * 10) / 10;
          humidity = Math.round((65 - diurnal) * 10) / 10;
          soilPh = 7.1;
          leafWetness = 12;
        }
      }

      const newReading: SensorTelemetry = {
        id: `tel-sim-${farm.id}-${Date.now()}`,
        deviceId,
        farmId: farm.id,
        timestamp: nowIso,
        soilMoisture,
        soilTemperature: soilTemp,
        ambientTemperature: ambTemp,
        relativeHumidity: humidity,
        soilPh,
        nitrogen: 130 + Math.round((Math.random() - 0.5) * 10),
        phosphorus: 25 + Math.round((Math.random() - 0.5) * 4),
        potassium: 190 + Math.round((Math.random() - 0.5) * 8),
        leafWetness,
        lightIntensityLux: ambTemp > 24 ? 42000 : 25000,
        rainfallMm,
        batteryVoltage: 3.92,
        isSimulated: true,
        dataQuality,
      };

      storage.addTelemetry(newReading);

      // Run rules engine to evaluate active risk and post alerts
      const evalResult = CropRulesEngine.evaluate(farm.currentCropId, farm.growthStage, newReading, farm.id);
      for (const alert of evalResult.alerts) {
        if (alert.severity === 'High risk' || alert.severity === 'Watch') {
          storage.addAlert(alert);
        }
      }
    }

    storage.setSimulationState({ lastTickedAt: nowIso });
  }
}

export const simulationService = SimulationService.getInstance();

