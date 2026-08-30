import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(40 33% 98%)",
        foreground: "hsl(24 10% 10%)",
        surface: "hsl(0 0% 100%)",
        border: "hsl(30 20% 90%)",
        muted: { DEFAULT: "hsl(38 20% 95%)", foreground: "hsl(25 10% 40%)" },
        primary: {
          DEFAULT: "hsl(25 95% 53%)",
          foreground: "hsl(0 0% 100%)",
          hover: "hsl(25 95% 47%)",
        },
        accent: {
          rose: "hsl(350 80% 60%)",
          amber: "hsl(45 95% 52%)",
          emerald: "hsl(152 60% 45%)",
          violet: "hsl(262 55% 58%)",
        },
      },
      boxShadow: {
        soft: "0 2px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        lift: "0 12px 32px -8px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
