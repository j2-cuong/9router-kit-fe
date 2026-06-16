import { getTokenFromHeader, getAccountFromToken, apiOk, apiError } from '../../../lib/mock-data';

export async function GET(req: Request) {
  return apiOk({ items: [
    { milestone: 3, package_name: 'Starter', value_vnd: '50000', key_prefix: 'ktx_mock_abc', created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      reset_at: new Date(Date.now() + 86400000 * 20).toISOString(), package_type: 'month' },
  ]});
}
