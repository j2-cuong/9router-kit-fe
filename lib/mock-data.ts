// Shared mock data for local dev when the backend is unavailable
// These are persisted in-memory; restarting the server resets all data.

import { cookies } from 'next/headers';

export type MockAccount = {
  id: string;
  username: string;
  email: string;
  password: string;
  referral_code: string;
  status: string;
  created_at: string;
};

export type MockApiKey = {
  id: string;
  key_prefix: string;
  api_key?: string;
  name: string;
  status: string;
  token_limit: number;
  token_used: number;
  token_remaining: number;
  expires_at: string;
  package_name: string;
  package_price: string;
  note: string;
  created_at: string;
  package_type?: string;
  order_code?: string;
  reset_at?: string;
  account_id?: string;
};

// In-memory store
const accounts: MockAccount[] = [];
const apiKeys: MockApiKey[] = [];

function generateId() {
  return `mock_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateToken(accountId: string) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: accountId, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 }));
  return `${header}.${payload}.mock_signature`;
}

export function getMockAccounts(): MockAccount[] {
  return accounts;
}

export function findAccountByUsername(username: string): MockAccount | undefined {
  return accounts.find(a => a.username === username);
}

export function createAccount(username: string, email: string, password: string, referralCode?: string): MockAccount {
  const account: MockAccount = {
    id: generateId(),
    username,
    email,
    password,
    referral_code: referralCode || `REF${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  accounts.push(account);
  return account;
}

export function authenticateAccount(username: string, password: string): MockAccount | null {
  const account = accounts.find(a => a.username === username && a.password === password);
  return account || null;
}

export function createMockApiKey(accountId: string, packageId?: string): MockApiKey {
  const keyPrefix = `ktx_mock_${Math.random().toString(36).slice(2, 10)}`;
  const key: MockApiKey = {
    id: generateId(),
    key_prefix: keyPrefix,
    api_key: `${keyPrefix}_${Math.random().toString(36).slice(2, 20)}`,
    name: 'Mock API Key',
    status: 'active',
    token_limit: 1000000,
    token_used: 0,
    token_remaining: 1000000,
    expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
    package_name: 'Starter',
    package_price: '100000',
    note: 'Created for testing',
    created_at: new Date().toISOString(),
    package_type: 'month',
    order_code: `ORD${Date.now()}`,
    account_id: accountId,
  };
  apiKeys.push(key);
  return key;
}

export function getApiKeysForAccount(accountId: string): MockApiKey[] {
  return apiKeys.filter(k => k.account_id === accountId);
}

export function deleteMockApiKey(id: string, accountId: string): boolean {
  const idx = apiKeys.findIndex(k => k.id === id && k.account_id === accountId);
  if (idx === -1) return false;
  apiKeys.splice(idx, 1);
  return true;
}

export function getTokenFromHeader(req: Request): string | null {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export function getAccountFromToken(token: string): MockAccount | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return accounts.find(a => a.id === payload.sub) || null;
  } catch {
    return null;
  }
}

export function apiOk<T>(data: T) {
  return Response.json({ success: true, data });
}

export function apiError(message: string, code = 'MOCK_ERROR', requestId = generateId()) {
  return Response.json({ success: false, error: { code, message, request_id: requestId } }, { status: 400 });
}
