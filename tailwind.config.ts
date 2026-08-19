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
        // Cards sit clearly off the background — borderless, but firmly raised.
        card: '0 2px 4px rgba(15, 23, 42, 0.06), 0 12px 28px rgba(15, 23, 42, 0.10)',
        // Hover / active lift for interactive cards.
        cardHover: '0 4px 8px rgba(15, 23, 42, 0.08), 0 20px 44px rgba(15, 23, 42, 0.14)',
        // The desktop sidebar and other large standing panels.
        panel: '0 4px 10px rgba(15, 23, 42, 0.06), 0 24px 56px rgba(15, 23, 42, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config;
