/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': "#5F6FFF",
        'primary-dark': "#4B55E6",
      },
      gridTemplateColumns: {
        'auto': 'repeat(auto-fill, minmax(200px , 1fr))'
      }
    },
  },
  plugins: [],
}