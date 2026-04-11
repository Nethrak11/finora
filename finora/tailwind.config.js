/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdf8f0', 100: '#fef3c7', 200: '#fde68a',
          accent: '#d97706', dark: '#1a1007', text: '#78350f'
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      }
    }
  },
  plugins: []
}
