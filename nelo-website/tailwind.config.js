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
            serif: ['Playfair Display', 'serif'],
            sans: ['Inter', 'system-ui', 'sans-serif'],
            display: ['Space Grotesk', 'system-ui', 'sans-serif'],
            modern: ['DM Sans', 'system-ui', 'sans-serif'],
          },
        },
      },
  plugins: [],
}

