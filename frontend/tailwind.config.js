/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-tea': '#8B4513',
        'secondary-tea': '#D2B48C',
        'accent-tea': '#F4A460',
        'light-tea': '#F5DEB3',
        'dark-tea': '#5D4037',
        'cream': '#FFF8E1',
        'gold': '#D4AF37',
      },
      fontFamily: {
        'heading': ['Playfair Display', 'serif'],
        'body': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
