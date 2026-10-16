import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  // lib/ entra aqui porque as cores (accent) dos módulos são definidas em lib/content.
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#050b17',
        panel: '#0d172a',
        primary: '#3b82f6',
        cyan: '#22d3ee',
        emerald: '#34d399',
      },
      boxShadow: {
        glow: '0 0 30px rgba(59,130,246,0.35)',
      },
      backgroundImage: {
        grid: 'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
