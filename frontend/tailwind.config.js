/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdfbf9',
          100: '#faf6f2',
          200: '#f3eae2',
          300: '#ecdcd3',
          400: '#cbb6ab',
          500: '#8c6b5e',
          600: '#785b50',
          700: '#592716',
          800: '#451e11', // Primary dark espresso brown matching other components
          900: '#36160c', // Hover espresso brown
          950: '#260e07',
        },
        sage: {
          50: '#f0fdf4',
          100: '#eef8f2', // Soft mint/sage badge from screenshot
          200: '#bbf7d0',
          700: '#15803d',
          800: '#166534', // Deep green badge text
          900: '#064e3b',
        },
      },
    },
  },
  plugins: [],
};
