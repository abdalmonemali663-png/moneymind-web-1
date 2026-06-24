/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Design tokens: MoneyMind AI -----------------------------
        // الخلفية: حبر عميق في الوضع الليلي / أبيض ناعم في الوضع النهاري
        ink: {
          DEFAULT: "#0B1220",
          900: "#0B1220",
          800: "#111A2E",
          700: "#172238",
          600: "#243149",
          500: "#3A4A66",
        },
        paper: {
          DEFAULT: "#F7F8FA",
          50: "#FFFFFF",
          100: "#F7F8FA",
          200: "#EEF1F5",
          300: "#E2E6EC",
        },
        // اللون المميز: زمردي عميق يرمز للنمو المالي الإيجابي
        emerald: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          400: "#34D399",
          500: "#10B981",
          600: "#0F9D6E",
          700: "#0C7A56",
          900: "#053B2A",
        },
        // لون التحذير/السلبي (مصروفات، تجاوز ميزانية)
        amber: {
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
        },
        rose: {
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
        },
        slate: {
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        tabular: ["var(--font-tabular)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 6px -1px rgb(0 0 0 / 0.06)",
        "card-dark": "0 1px 2px 0 rgb(0 0 0 / 0.3), 0 4px 16px -2px rgb(0 0 0 / 0.4)",
      },
      animation: {
        "count-up": "countUp 0.6s ease-out",
        "fade-in": "fadeIn 0.4s ease-out",
        "slide-up": "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        countUp: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
