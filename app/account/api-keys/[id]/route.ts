import { getTokenFromHeader, getAccountFromToken, deleteMockApiKey, apiOk, apiError } from '../../../../lib/mock-data';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = getTokenFromHeader(req);
  if (!token) return apiError('Unauthorized', 'UNAUTHORIZED');
  const account = getAccountFromToken(token);
  if (!account) return apiError('Account not found', 'NOT_FOUND');
  const { id } = await params;
  const ok = deleteMockApiKey(id, account.id);
  if (!ok) return apiError('Key not found', 'NOT_FOUND');
  return apiOk({ deleted: true });
}
