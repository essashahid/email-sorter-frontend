/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        success: "#16a34a",
        danger: "#dc2626"
      }
    },
  },
  plugins: [],
};
