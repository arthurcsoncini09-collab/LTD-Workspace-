import type { Config } from 'tailwindcss';
import defaultColors from 'tailwindcss/colors';

const config: Config = {
  darkMode: ['class'],
  // lib/ entra aqui porque as cores (accent) dos módulos são definidas em lib/content.
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        midnight: '#050b17',
        panel: '#0d172a',
        // Tokens do design system (definidos em app/globals.css)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        border: 'hsl(var(--border))',
        ring: 'hsl(var(--ring))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        // Mantém todos os tons (cyan-300, emerald-400…) e define a cor padrão de `cyan` e `emerald`.
        // Antes, uma string única aqui apagava os tons e classes como text-cyan-300 não geravam CSS.
        cyan: { ...defaultColors.cyan, DEFAULT: '#22d3ee' },
        emerald: { ...defaultColors.emerald, DEFAULT: '#34d399' },
      },
      boxShadow: {
        glow: '0 8px 24px -12px rgba(59,130,246,0.45)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
