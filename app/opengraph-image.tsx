import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 72, background: 'radial-gradient(circle at 20% 10%, #21445a 0, transparent 34%), radial-gradient(circle at 80% 20%, #3b2364 0, transparent 36%), #04050a', color: '#e8eef9', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ fontSize: 28, letterSpacing: 8, textTransform: 'uppercase', color: '#7ee8ff' }}>9router</div>
      <div style={{ marginTop: 28, fontSize: 86, lineHeight: 0.96, letterSpacing: -5, fontWeight: 700 }}>One API For All Agents</div>
      <div style={{ marginTop: 28, fontSize: 28, color: '#aab7d4' }}>Claude 4.8 • GPT 5.5 • Gemini 3.5 • Codex IDE</div>
    </div>,
    size
  );
}
