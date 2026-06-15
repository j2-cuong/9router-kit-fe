import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';

const siteName = '9router';
const siteDescription = 'Modern API gateway for premium coding IDEs, routing Claude 4.8, GPT 5.5, Gemini 3.5 and more through a single secure key layer.';

export const metadata: Metadata = {
  metadataBase: new URL('https://api.agent-gateway.site'),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    'AI API',
    'Claude 4.8',
    'GPT 5.5',
    'Gemini 3.5',
    'Coding IDE API',
    'LLM gateway',
    'premium model provider',
    'Telegram bot pricing'
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    title: siteName,
    description: siteDescription,
    siteName,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: siteName }]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/opengraph-image']
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className="antialiased">
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
