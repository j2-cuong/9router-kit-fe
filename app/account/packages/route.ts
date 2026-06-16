import { apiOk } from '../../../lib/mock-data';

const packages = [
  { id: 'pkg_starter', code: 'STARTER', name: 'Starter', package_type: 'month', price: '100000', token_limit: 1000000, duration_seconds: 2592000, duration_days: 30 },
  { id: 'pkg_basic', code: 'BASIC', name: 'Basic', package_type: 'month', price: '200000', token_limit: 3000000, duration_seconds: 2592000, duration_days: 30 },
  { id: 'pkg_pro', code: 'PRO', name: 'Professional', package_type: 'month', price: '500000', token_limit: 10000000, duration_seconds: 2592000, duration_days: 30 },
  { id: 'pkg_enterprise', code: 'ENTERPRISE', name: 'Enterprise', package_type: 'month', price: '1000000', token_limit: 50000000, duration_seconds: 2592000, duration_days: 30 },
  { id: 'pkg_hourly', code: 'HOURLY', name: 'Hour Pass', package_type: 'hour', price: '50000', token_limit: 0, duration_seconds: 3600, duration_days: 0 },
];

export async function GET() {
  return apiOk({ items: packages });
}
