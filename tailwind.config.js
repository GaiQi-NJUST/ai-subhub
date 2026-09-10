/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        warm: {
          bg: '#F8F8F5',
          card: '#FFFFFF',
          border: '#E8E7E1',
          muted: '#71717A',
          subtle: '#F1F0EB',
          text: '#18181B',
        },
        forest: {
          900: '#142E18',
          800: '#1A3D20',
          700: '#23532C',
          500: '#348B47',
        },
        openai: {
          dark: '#0B0F19',
          surface: '#131A29',
          accent: '#10A37F',
          accentHover: '#0D8A6A',
          border: '#1E293B',
        },
        claude: {
          bg: '#FAF7F2',
          surface: '#FFFFFF',
          accent: '#D96B43',
          accentHover: '#C45731',
          border: '#EAE5DB',
          dark: '#2A1F1B',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 30px -5px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'elevated': '0 20px 40px -15px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)',
        'glow-green': '0 0 30px -5px rgba(16, 163, 127, 0.3)',
        'glow-terracotta': '0 0 30px -5px rgba(217, 107, 67, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
