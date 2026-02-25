/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-tea': 'var(--primary-tea)',
        'accent-tea': 'var(--accent-tea)',
        'dark-tea': 'var(--dark-tea)',
        'light-tea': 'var(--light-tea)',
        'cream': 'var(--cream)',
        'secondary-tea': 'var(--secondary-tea)',
      }
    },
  },
  plugins: [],
}