/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,jsx,tsx,ts}'],
  theme: {
    extend: {
      colors: {
        customWhite: '#ffffff',
        caribbean: '#0d5c63',
        verdigris: '#44a1a0',
        tiffanyBlue: '#78cdd7',
        teal: '#247b7b'
      }
    }
  },
  plugins: []
}
