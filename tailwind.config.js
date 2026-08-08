/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        asfalto: '#1E2229',
        terracota: '#D45D39',
        arena: '#EFECE6',
        crecimiento: '#10B981',
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      borderRadius: {
        '2rem': '2rem',
        '3rem': '3rem',
        '4rem': '4rem',
      }
    },
  },
  plugins: [],
}
