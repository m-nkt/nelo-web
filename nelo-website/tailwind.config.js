/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
      theme: {
        extend: {
          fontFamily: {
            serif: ['var(--font-playfair)'],
            sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
            display: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
            modern: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
          },
        },
      },
  plugins: [],
}

