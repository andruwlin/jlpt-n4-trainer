import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        matcha: "#6f9e7a",
        sakura: "#f6b8c7",
        ink: "#24312a",
        paper: "#fffaf2",
      },
      boxShadow: {
        card: "0 12px 30px rgba(36, 49, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
