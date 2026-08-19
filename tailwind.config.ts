import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        kibs: {
          green: '#66c70e',
          deepGreen: '#15803d',
          red: '#e31837',
          ink: '#1d1f23',
          panel: '#f7f9fb',
        },
      },
      boxShadow: {
        soft: '0 16px 40px rgba(29, 31, 35, 0.08)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 24px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
} satisfies Config;
