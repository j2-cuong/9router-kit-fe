import { apiOk, apiError } from '../../../../lib/mock-data';

export async function POST(req: Request) {
  try {
    const { api_key } = await req.json();
    if (!api_key) return apiError('API key is required');
    
    const keyPrefix = api_key.split('_')[0] + '_' + api_key.split('_')[1];
    return apiOk({
      access_token: api_key,
      token_type: 'Bearer',
      api_key: {
        id: 'mock_key_id',
        key_prefix: keyPrefix,
        status: 'active',
        token_limit: 1000000,
        token_used: 12500,
        token_remaining: 987500,
        expires_at: new Date(Date.now() + 86400000 * 25).toISOString(),
        expires_in_seconds: 2160000,
        reset_at: new Date(Date.now() + 86400000 * 30).toISOString(),
      },
      package: {
        id: 'pkg_starter',
        code: 'STARTER',
        name: 'Starter',
        package_type: 'month',
        duration_days: 30,
        duration_seconds: 2592000,
      },
      router: {
        id: 'router_1',
        code: 'DEFAULT',
        base_url: 'https://api.agent-gateway.site',
      },
      usage: {
        request_count: 42,
        input_tokens: 500000,
        output_tokens: 250000,
        total_tokens: 750000,
        last_request_at: new Date(Date.now() - 3600000).toISOString(),
      },
    });
  } catch (e) {
    return apiError('Invalid request body');
  }
}
