/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#10243A', 700: '#1B3652', 600: '#27496B' },
        brand: { DEFAULT: '#1769AA', 600: '#125A93', 50: '#EAF3FA' },
        accent: { DEFAULT: '#35B6C9', 600: '#2698AA' },
        surface: '#F5F8FB',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Khmer', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
