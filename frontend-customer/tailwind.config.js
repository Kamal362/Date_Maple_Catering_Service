/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-tea': '#8B4513',
        'accent-tea': '#D2691E',
        'dark-tea': '#5D4037',
        'light-tea': '#F5DEB3',
        'cream': '#FFF8E1',
        'secondary-tea': '#D2B48C',
      }
    },
  },
  plugins: [],
}