/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        flame: {
          50: "#fff4ed",
          100: "#ffe6d3",
          200: "#ffc9a5",
          300: "#ffa06d",
          400: "#ff6b35",
          500: "#f94516",
          600: "#ea2c0c",
          700: "#c21f0c",
          800: "#9a1b12",
          900: "#7c1a12",
        },
        coal: {
          900: "#0d0d0f",
          800: "#141416",
          700: "#1c1c1f",
          600: "#242428",
          500: "#2e2e33",
          400: "#3a3a40",
          300: "#52525c",
          200: "#71717a",
          100: "#a1a1aa",
          50: "#d4d4d8",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards",
        pulse_slow: "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: {
          from: { opacity: 0, transform: "translateY(16px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
