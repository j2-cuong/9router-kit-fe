import { apiOk } from '../../../lib/mock-data';

export async function GET() {
  return apiOk({
    summary: { earned_vnd: '100000', redeemed_vnd: '0', available_vnd: '100000' },
    rewards: [
      { package_name: 'Starter', amount_vnd: '50000', key_prefix: 'ktx_mock_abc', status: 'active', note: 'Reward', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    ],
    redemptions: [],
  });
}
