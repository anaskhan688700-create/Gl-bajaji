import { describe, it, expect } from 'vitest';
import { storage } from '../services/storage';

describe('IoT Sensor Ingestion Validation Rules', () => {
  it('identifies registered device tokens correctly', () => {
    const validToken = 'kr_live_token_karnal_01';
    const device = storage.getDeviceByToken(validToken);
    expect(device).toBeDefined();
    expect(device?.id).toBe('ESP32-KR-001');

    const fakeToken = 'invalid_device_token_xyz';
    const fakeDevice = storage.getDeviceByToken(fakeToken);
    expect(fakeDevice).toBeUndefined();
  });

  it('validates sensor reading boundary physics', () => {
    // Check bounds
    const isMoistureValid = (val: number) => typeof val === 'number' && !isNaN(val) && val >= 0 && val <= 100;
    const isTempValid = (val: number) => typeof val === 'number' && !isNaN(val) && val >= -10 && val <= 65;
    const isPhValid = (val: number) => typeof val === 'number' && !isNaN(val) && val >= 2.0 && val <= 12.0;

    expect(isMoistureValid(45.2)).toBe(true);
    expect(isMoistureValid(-5)).toBe(false);
    expect(isMoistureValid(105)).toBe(false);

    expect(isTempValid(24.5)).toBe(true);
    expect(isTempValid(-15)).toBe(false);
    expect(isTempValid(75)).toBe(false);

    expect(isPhValid(6.8)).toBe(true);
    expect(isPhValid(1.5)).toBe(false);
    expect(isPhValid(13.5)).toBe(false);
  });
});

