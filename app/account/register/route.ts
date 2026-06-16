import { createAccount, apiOk, apiError } from '../../../lib/mock-data';

export async function POST(req: Request) {
  try {
    const { username, email, password, referral_code } = await req.json();
    if (!username || !email || !password) {
      return apiError('Username, email and password are required');
    }
    const account = createAccount(username, email, password, referral_code);
    const access_token = `${btoa(JSON.stringify({ alg: 'HS256' }))}.${btoa(JSON.stringify({ sub: account.id, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 * 7 }))}.mock_sig`;
    return apiOk({
      access_token,
      token_type: 'Bearer',
      account: { id: account.id, username: account.username, email: account.email, referral_code: account.referral_code, status: account.status },
    });
  } catch (e) {
    return apiError('Invalid request body');
  }
}
