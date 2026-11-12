/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#080F17',
          sidebar: '#0D1722',
          card: '#111E2B',
          surface: '#172636',
          border: '#263849',
          accent: '#12D6C5',
          cyan: '#38BDF8',
          text: '#F1F5F9',
          muted: '#94A3B8',
        },
        light: {
          bg: '#F3F7FA',
          sidebar: '#FFFFFF',
          card: '#FFFFFF',
          surface: '#EDF4F8',
          border: '#D8E3EA',
          accent: '#089E9A',
          cyan: '#0284C7',
          text: '#0F172A',
          muted: '#64748B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'card-light': '0 2px 12px -1px rgba(0, 0, 0, 0.06)',
        'glow-teal': '0 0 15px rgba(18, 214, 197, 0.25)',
      },
    },
  },
  plugins: [],
}

