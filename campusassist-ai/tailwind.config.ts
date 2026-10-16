import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        brand: {
          gold: '#F2A900',
          crimson: '#A10F14',
          dark: '#6E0A0E',
          navy: '#14213D',
        },
      },
    },
  },
  plugins: [],
};

export default config;
