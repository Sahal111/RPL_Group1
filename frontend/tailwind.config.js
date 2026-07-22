/** @type {import('tailwindcss').Config} */
// NOTE: Tailwind v4 — konfigurasi warna custom sudah dipindah ke @theme di index.css
// File ini hanya untuk content paths dan plugin (jika ada)
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        headline: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
