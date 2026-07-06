import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#19202a",
        line: "#d8dee8",
        panel: "#f6f8fb",
        action: "#256f8f",
        success: "#2d7d54",
        danger: "#b3261e"
      }
    }
  },
  plugins: []
};

export default config;
