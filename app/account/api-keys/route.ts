import { getTokenFromHeader, getAccountFromToken, getApiKeysForAccount, createMockApiKey, deleteMockApiKey, apiOk, apiError } from '../../../lib/mock-data';

export async function GET(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return apiError('Unauthorized', 'UNAUTHORIZED');
  const account = getAccountFromToken(token);
  if (!account) return apiError('Account not found', 'NOT_FOUND');
  const keys = getApiKeysForAccount(account.id);
  return apiOk({ items: keys });
}

export async function POST(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return apiError('Unauthorized', 'UNAUTHORIZED');
  const account = getAccountFromToken(token);
  if (!account) return apiError('Account not found', 'NOT_FOUND');
  const { package_id } = await req.json();
  const key = createMockApiKey(account.id, package_id);
  return apiOk(key);
}

export async function DELETE(req: Request) {
  const token = getTokenFromHeader(req);
  if (!token) return apiError('Unauthorized', 'UNAUTHORIZED');
  const account = getAccountFromToken(token);
  if (!account) return apiError('Account not found', 'NOT_FOUND');
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop();
  if (!id) return apiError('Key ID required');
  // DELETE with body params; we handle path-based deletion in a separate [id] route
  return apiError('Use DELETE /account/api-keys/[id]', 'NOT_IMPLEMENTED');
}
