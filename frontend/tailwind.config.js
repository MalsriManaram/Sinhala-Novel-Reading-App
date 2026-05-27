/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}", "./public/index.html"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C7923E",
          hover: "#D8A758",
          dim: "#B27A2B",
        },
        ink: {
          900: "#0B0C10",
          800: "#15161C",
          700: "#1F2029",
        },
        cream: {
          50: "#F8F8F7",
          100: "#EBEBEA",
        },
      },
      fontFamily: {
        display: ["Outfit", "ui-sans-serif", "system-ui"],
        sinhala: ["'Noto Sans Sinhala'", "Abhaya Libre", "serif"],
        serif: ["Lora", "Georgia", "serif"],
      },
      boxShadow: {
        glass: "0 8px 32px rgba(0,0,0,0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out both",
        "fade-in": "fadeIn 0.4s ease-out both",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
