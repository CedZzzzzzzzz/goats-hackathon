import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Student-side palette
        "campus-red":       "#951A1A",
        "campus-red-dark":  "#7A1515",
        // PUPILA admin palette — scoped to admin shell and components
        "pupila-bg":        "#fbf8f5",
        "pupila-card":      "#fffefd",
        "pupila-ink":       "#2b1716",
        "pupila-mute":      "#74635e",
        "pupila-line":      "#eadfd8",
        "pupila-brand":     "#971b1f",
        "pupila-tint":      "#f9e9e5",
        "pupila-soft":      "#f6eee8",
        "pupila-gold":      "#f5b400",
        "pupila-gold-soft": "#fff2c7",
        "pupila-green":     "#1f8a5b",
      },
    },
  },
  plugins: [],
};

export default config;