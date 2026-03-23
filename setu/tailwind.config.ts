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
        background: "#0A192F",
        card: "#112240",
        primary: "#FACC15",
        textMain: "#E6F1FF",
        textMuted: "#8892B0",
      },
      boxShadow: {
        'neumorphic': '10px 10px 20px #060f1d, -10px -10px 20px #0e2341',
        'neumorphic-inset': 'inset 8px 8px 16px #081426, inset -8px -8px 16px #1a305a',
        'glow': '0 0 20px rgba(250, 204, 21, 0.4)',
      }
    },
  },
  plugins: [],
};
export default config;
