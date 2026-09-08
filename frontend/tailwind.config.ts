import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#f8fafc",
        surface: "#f1f5f9",
        panel: "#ffffff",
        border: "#cbd5e1",
        brand: {
          navy: "#0f172a",
          blue: "#2563eb",
          red: "#dc2626",
          amber: "#d97706",
          green: "#059669",
          cyan: "#0891b2"
        }
      },
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
        sans: ["var(--font-sans)", "sans-serif"]
      }
    },
  },
  plugins: [],
};
export default config;
