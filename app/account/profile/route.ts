import { getTokenFromHeader, getAccountFromToken, apiOk, apiError } from '../../../lib/mock-data';

export async function GET(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return apiError('Unauthorized', 'UNAUTHORIZED');
  const account = getAccountFromToken(token);
  if (!account) return apiError('Account not found', 'NOT_FOUND');
  return apiOk({
    profile: {
      account_id: account.id,
      contact_email: account.email,
      telegram_user_id: '',
      telegram_username: '',
      bank_name: '',
      bank_account_name: '',
      bank_account_number: '',
      note: '',
    }
  });
}

export async function PUT(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return apiError('Unauthorized', 'UNAUTHORIZED');
  const account = getAccountFromToken(token);
  if (!account) return apiError('Account not found', 'NOT_FOUND');
  return apiOk({ profile: { ...(await req.json()), account_id: account.id } });
}
