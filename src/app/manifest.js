export default function manifest() {
  return {
    name: 'InvestAir',
    short_name: 'InvestAir',
    description: 'Install InvestAir for faster access to investor wallet funding rails, property discovery, and dashboard activity.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#0f172a',
    categories: ['finance', 'business', 'productivity'],
    lang: 'en-US',
    icons: [
      {
        src: '/icon-192.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
      {
        src: '/icon-512.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any maskable',
      },
    ],
  };
}