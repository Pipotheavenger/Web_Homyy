/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",   // si usas app router
  ],
  theme: {
    extend: {
      colors: {
        primary:  "#7B61FF",
        lavender: "#EDE9FE",
      },
    },
  },
  plugins: [],
};
