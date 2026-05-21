/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep modern dark background palette
        bgDeep: "#0B0F19",
        bgSurface: "#161E31",
        borderDark: "#263554",
        // Harmony vibrant accents
        primary: {
          50: "#F0F5FF",
          100: "#E1EBFF",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
        },
        accent: {
          green: "#10B981", // Emerald-500
          gold: "#F59E0B",  // Amber-500
          red: "#EF4444",   // Red-500
        }
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "sans-serif"],
      },
    },
  },
  plugins: [],
}
