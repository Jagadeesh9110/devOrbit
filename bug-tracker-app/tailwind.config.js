/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          600: "#2563eb", // blue-600
          700: "#1d4ed8", // blue-700
        },
        accent: {
          500: "#14b8a6", // teal-500
          600: "#0d9488", // teal-600
        },
        success: {
          500: "#22c55e", // green-500
        },
        slate: {
          700: "#334155", // slate-700
        },
      },
    },
  },
  darkMode: "class",
  plugins: [],
};
