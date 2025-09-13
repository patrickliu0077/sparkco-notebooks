import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors inspired by the warm orange/peach gradient
        brand: {
          50: '#FFF7F2',
          100: '#FFE9DC',
          200: '#FFC9AF',
          300: '#FF9E73',
          400: '#FF7A45',
          500: '#F6541D',
          600: '#E8440F',
          700: '#C73608',
          800: '#A02D0A',
          900: '#7C2D12',
        },
        // Text colors
        foreground: '#0F172A',
        'foreground-muted': '#475569',
        // Surface colors
        surface: '#FFFFFF',
        'surface-soft': '#FFF7F2',
        'surface-elevated': '#FFFFFF',
        // Accent colors for different node types
        accent: {
          blue: '#3B82F6',
          green: '#10B981',
          purple: '#8B5CF6',
          yellow: '#F59E0B',
          red: '#EF4444',
        },
        // Border colors
        border: '#E5E7EB',
        'border-muted': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '14px',
        'xl': '18px',
      },
      boxShadow: {
        'soft': '0 10px 25px rgba(253, 138, 94, 0.12)',
        'elevated': '0 20px 40px rgba(253, 138, 94, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.16s ease-out',
        'slide-up': 'slideUp 0.24s ease-out',
        'scale-in': 'scaleIn 0.16s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
