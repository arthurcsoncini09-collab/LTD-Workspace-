import type { MetadataRoute } from 'next';

// Manifesto do app (PWA): permite instalar o NetLearn na tela inicial do celular.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NetLearn — Fundamentos de Redes',
    short_name: 'NetLearn',
    description: 'Aulas, laboratórios e simulações para aprender redes de computadores.',
    id: '/',
    start_url: '/dashboard?origem=app',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#050912',
    theme_color: '#050912',
    lang: 'pt-BR',
    categories: ['education'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Continuar estudando', url: '/dashboard', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Simulação de carreira', url: '/simulacao', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
      { name: 'Laboratórios', url: '/labs', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
    ],
  };
}
