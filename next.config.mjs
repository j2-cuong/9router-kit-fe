import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiBase = (process.env.SERVER_API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'https://api.agent-gateway.site').replace(/\/+$/, '');
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  async rewrites() {
    return [
      { source: '/auth/:path*', destination: `${apiBase}/auth/:path*` },
      { source: '/account/:path*', destination: `${apiBase}/account/:path*` },
      { source: '/admin/:path*', destination: `${apiBase}/admin/:path*` },
      { source: '/telegram/:path*', destination: `${apiBase}/telegram/:path*` },
      { source: '/v1/:path*', destination: `${apiBase}/v1/:path*` },
      { source: '/v1beta/:path*', destination: `${apiBase}/v1beta/:path*` },
      { source: '/health', destination: `${apiBase}/health` }
    ];
  }
};

export default nextConfig;
