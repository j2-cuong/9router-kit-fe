import { getTokenFromHeader, getAccountFromToken, apiOk, apiError } from '../../../lib/mock-data';

export async function GET(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return apiError('Unauthorized', 'UNAUTHORIZED');
  const account = getAccountFromToken(token);
  if (!account) return apiError('Account not found', 'NOT_FOUND');
  return apiOk({
    account: { id: account.id, username: account.username, email: account.email, referral_code: account.referral_code, status: account.status },
  });
}
