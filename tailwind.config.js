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
        forest: {
          DEFAULT: '#163D2B',
          light: '#1F533B',
          dark: '#0E281C',
        },
        agri: {
          DEFAULT: '#25834B',
          light: '#2EA55E',
          dark: '#1C6439',
        },
        limeAccent: {
          DEFAULT: '#B5E853',
          light: '#C7EE7B',
          dark: '#9BCB3F',
        },
        warmBg: '#F7F8F2',
        darkText: '#17251D',
        secondaryText: '#68756D',
        warningAmber: '#E9A23B',
        criticalRed: '#D94841',

        // Dedicated Dark Theme Tokens
        darkBg: '#0B140F',
        darkSurface: '#121E17',
        darkCard: '#17271F',
        darkCardHover: '#1D3227',
        darkBorder: '#243D30',
        darkTextPrimary: '#F1F7F3',
        darkTextSecondary: '#9CB3A6',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(22, 61, 43, 0.05)',
        'card': '0 4px 20px rgba(22, 61, 43, 0.07)',
        'elevated': '0 10px 30px rgba(22, 61, 43, 0.12)',
        'dark-card': '0 4px 20px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
