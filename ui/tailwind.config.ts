import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // RPG dark theme
        void: {
          900: '#0a0a14',
          800: '#12121f',
          700: '#1a1a2e',
          600: '#24243a',
        },
        gold: {
          400: '#f5c542',
          500: '#d4a531',
          600: '#b8891f',
        },
        arcane: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
        },
        installed: {
          400: '#4ade80',
          500: '#22c55e',
        },
        danger: {
          400: '#f87171',
          500: '#ef4444',
        },
      },
      boxShadow: {
        glow: '0 0 12px rgba(245, 197, 66, 0.4)',
        'glow-arcane': '0 0 12px rgba(139, 92, 246, 0.4)',
        'glow-installed': '0 0 12px rgba(34, 197, 94, 0.3)',
      },
    },
  },
  plugins: [],
} satisfies Config;
