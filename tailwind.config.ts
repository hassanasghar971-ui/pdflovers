import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#DC2626",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgba(220,38,38,0.25)",
      },
    },
  },
  plugins: [typography],
};

export default config;
