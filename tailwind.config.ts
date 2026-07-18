import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9ebff",
          200: "#bcdcff",
          300: "#8ec5ff",
          400: "#59a3ff",
          500: "#337dff",
          600: "#1c5df5",
          700: "#1548e1",
          800: "#183cb6",
          900: "#19388f",
        },
        // Laranja da marca VALENLOG (o "LOG")
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f5821f",
          600: "#ea6c0a",
          700: "#c2560b",
          800: "#9a4510",
          900: "#7c3a11",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
