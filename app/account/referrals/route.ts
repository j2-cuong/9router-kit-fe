import { apiOk } from '../../../lib/mock-data';

export async function GET() {
  return apiOk({ items: [
    { referred_username: 'friend1', value_vnd: '50000', note: 'Test referral', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { referred_username: 'friend2', value_vnd: '50000', note: 'Test referral', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  ]});
}
