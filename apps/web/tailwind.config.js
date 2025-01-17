/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00A67E',
          50: '#E6F7F2',
          100: '#CCEFE5',
          200: '#99DFD1',
          300: '#66CFBD',
          400: '#33BFA9',
          500: '#00A67E',
          600: '#008564',
          700: '#00644B',
          800: '#004332',
          900: '#002119',
        },
      },
    },
  },
  plugins: [],
}
