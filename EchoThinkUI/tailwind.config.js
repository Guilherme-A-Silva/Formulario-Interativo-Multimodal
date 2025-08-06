/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      borderRadius: {
        '30px': '30px',
        '20px': '20px'
      }
    }
  },
  plugins: []
}
