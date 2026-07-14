import { DeviceInfo } from '../types';

// Helper to generate a MAC-address-like identifier based on a seed or random bytes
function generateVirtualMac(): string {
  const hexDigits = '0123456789ABCDEF';
  let mac = 'AE'; // Locally administered unicast address prefix
  for (let i = 0; i < 5; i++) {
    mac += ':';
    mac += hexDigits.charAt(Math.floor(Math.random() * 16));
    mac += hexDigits.charAt(Math.floor(Math.random() * 16));
  }
  return mac;
}

// Generates a simple UUID
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEY = 'daily_planner_device_info';

export function getOrCreateDeviceInfo(): DeviceInfo {
  const cached = localStorage.getItem(STORAGE_KEY);
  if (cached) {
    try {
      return JSON.parse(cached) as DeviceInfo;
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  const newInfo: DeviceInfo = {
    id: generateUUID(),
    simulatedMac: generateVirtualMac(),
    firstSeen: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newInfo));
  return newInfo;
}
