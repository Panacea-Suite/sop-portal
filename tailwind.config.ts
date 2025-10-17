import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#FFE5E6',
          100: '#FFCCCE',
          200: '#FF999C',
          300: '#FF666B',
          400: '#FF3339',
          500: '#FF1E25',
          600: '#E01B22',
          700: '#B3151A',
          800: '#8C1014',
          900: '#660B0E',
        },
        brand: {
          red: '#FF1E25',
          black: '#000000',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
        'strong': '0 20px 50px -12px rgba(255, 30, 37, 0.25)',
      },
    },
  },
  plugins: [],
}
export default config
