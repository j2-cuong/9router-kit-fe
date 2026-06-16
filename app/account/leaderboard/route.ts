import { apiOk } from '../../../lib/mock-data';

export async function GET() {
  return apiOk({ items: [
    { username: 'topuser1', purchased_keys: 15, total_spent_vnd: '5000000' },
    { username: 'topuser2', purchased_keys: 10, total_spent_vnd: '3000000' },
    { username: 'topuser3', purchased_keys: 8, total_spent_vnd: '2000000' },
  ]});
}
