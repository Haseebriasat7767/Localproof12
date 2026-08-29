import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0B1220",
          900: "#0B1220",
          800: "#111827",
          700: "#1B2537",
          600: "#2A3548",
        },
        teal: {
          DEFAULT: "#14B8A6",
          500: "#14B8A6",
          400: "#2DD4BF",
          600: "#0D9488",
          50: "#F0FDFA",
          100: "#CCFBF1",
        },
        ink: {
          DEFAULT: "#0F172A",
          soft: "#64748B",
          muted: "#94A3B8",
        },
        canvas: "#F8FAFC",
        border: "#E2E8F0",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(15,23,42,0.04), 0 1px 3px 0 rgba(15,23,42,0.06)",
        lift: "0 10px 30px -12px rgba(15,23,42,0.18)",
        glow: "0 0 0 4px rgba(20,184,166,0.12)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out both",
        "slide-up": "slide-up 320ms cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.6s infinite",
        "accordion-down": "accordion-down 220ms ease-out",
        "accordion-up": "accordion-up 220ms ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
