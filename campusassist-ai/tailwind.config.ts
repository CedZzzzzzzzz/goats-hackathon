import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon:          "#8B1A1A",
        "maroon-deep":   "#4A0C0C",
        crimson:         "#A31F1F",
        "brand-orange":  "#E8590C",
        gold:            "#F5B301",
        ink:             "#1E2A3A",
        slate:           "#6B7A8C",
        surface:         "#F4F6FA",
        blush:           "#FBEAEA",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        // Used only in page.tsx / ChatWindow via bg-grad-btn utility class
        "grad-btn":  "linear-gradient(135deg, #8B1A1A 0%, #A31F1F 100%)",
        "grad-text": "linear-gradient(90deg, #8B1A1A 0%, #E8590C 60%, #F5B301 100%)",
      },
      boxShadow: {
        card:         "0 10px 30px rgba(139,26,26,0.08)",
        "card-hover": "0 16px 40px rgba(139,26,26,0.16)",
        header:       "0 1px 0 rgba(0,0,0,0.10), 0 2px 10px rgba(139,26,26,0.30)",
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
}

export default config
