import './globals.css';
import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SiteShell } from '@/components/site-shell';
import { PwaSupport } from '@/components/pwa';

export const metadata: Metadata = {
  title: 'NetLearn | Fundamentos de Redes',
  description: 'Plataforma interativa de redes com aulas, laboratórios e desafios.',
  applicationName: 'NetLearn',
  appleWebApp: { capable: true, title: 'NetLearn', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#050912',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body>
        <SiteShell>{children}</SiteShell>
        <PwaSupport />
      </body>
    </html>
  );
}
