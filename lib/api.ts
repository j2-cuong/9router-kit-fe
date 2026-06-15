export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; request_id: string };
};

export class ApiError extends Error {
  code: string;
  requestId: string;

  constructor(message: string, code = 'REQUEST_FAILED', requestId = '') {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.requestId = requestId;
  }
}

const rawApiBase = process.env.NEXT_PUBLIC_API_BASE;
const API_BASE = (rawApiBase === undefined ? 'https://api.agent-gateway.site' : rawApiBase).trim().replace(/\/+$/, '');

export function getApiBase() {
  return API_BASE;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    cache: 'no-store'
  });
  const body = await res.json() as ApiEnvelope<T>;
  if (!res.ok || !body.success) throw new ApiError(body.error?.message || 'Request failed', body.error?.code, body.error?.request_id);
  return body.data as T;
}
