/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B0F0E',
        sidebar: '#101613',
        card: {
          DEFAULT: '#151C18',
          elevated: '#1B241E',
        },
        surface: '#151C18',
        forest: {
          DEFAULT: '#123D2D',
          dark: '#0C2B20',
          light: '#1B523D',
        },
        lime: {
          DEFAULT: '#C8F169',
          dark: '#B0D954',
          light: '#D9F88A',
        },
        text: {
          primary: '#F2F5F0',
          secondary: '#A0ADA3',
          muted: '#6F7C72',
        },
        charcoal: {
          DEFAULT: '#F2F5F0',
          muted: '#A0ADA3',
        },
        border: '#29352D',
        status: {
          success: '#8FE388',
          positive: '#8FE388',
          warning: '#F2C66D',
          danger: '#F08080',
          negative: '#F08080',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '1rem', // 16px
      }
    },
  },
  plugins: [],
}
