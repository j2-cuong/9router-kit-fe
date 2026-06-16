import { findAccountByUsername, authenticateAccount, apiOk, apiError } from '../../../lib/mock-data';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return apiError('Username and password are required');
    }
    const account = authenticateAccount(username, password);
    if (!account) {
      return apiError('Invalid username or password', 'INVALID_CREDENTIALS');
    }
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
