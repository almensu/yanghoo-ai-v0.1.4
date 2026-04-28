import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        muted: '#64748b',
        panel: '#ffffff',
        canvas: '#f8fafc',
        accent: '#2563eb',
        line: '#e2e8f0'
      },
      boxShadow: {
        panel: '0 1px 2px rgb(15 23 42 / 0.05)'
      }
    }
  },
  plugins: []
};

export default config;
