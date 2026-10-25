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
        finance: {
          bg: '#0A0E17',
          subtle: '#0F172A',
          card: '#131D31',
          cardBorder: '#1E293B',
          hover: '#1E2B45',
          emerald: '#10B981',
          cyan: '#06B6D4',
          blue: '#3B82F6',
          purple: '#8B5CF6',
          rose: '#F43F5E',
          amber: '#F59E0B'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
