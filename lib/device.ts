'use client';

export type ClientDeviceInfo = {
  device_id: string;
  device_fingerprint: string;
  platform: string;
  language: string;
  timezone: string;
  screen: string;
};

const deviceIDKey = '9router_device_id';

export function getClientDeviceInfo(): ClientDeviceInfo {
  if (typeof window === 'undefined') {
    return { device_id: '', device_fingerprint: '', platform: '', language: '', timezone: '', screen: '' };
  }

  const deviceID = getOrCreateDeviceID();
  const nav = window.navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || 'Unknown platform';
  const language = nav.language || nav.languages?.[0] || 'Unknown language';
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown timezone';
  const screen = `${window.screen.width}x${window.screen.height}@${Math.round((window.devicePixelRatio || 1) * 100) / 100}`;
  const device_fingerprint = stableHash([deviceID, platform, language, timezone, screen].join('|'));

  return { device_id: deviceID, device_fingerprint, platform, language, timezone, screen };
}

function getOrCreateDeviceID() {
  const existing = window.localStorage.getItem(deviceIDKey);
  if (existing) return existing;
  const id = window.crypto?.randomUUID?.() || `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(deviceIDKey, id);
  return id;
}

function stableHash(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `fp_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}
