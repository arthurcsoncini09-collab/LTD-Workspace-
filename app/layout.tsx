import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { SiteShell } from '@/components/site-shell';

export const metadata: Metadata = {
  title: 'NetLearn | Fundamentos de Redes',
  description: 'Plataforma interativa de redes com aulas, laboratórios e desafios.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
