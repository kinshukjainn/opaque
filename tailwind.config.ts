// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Add your custom font here
        ubuntu: "var(--font-ubuntu) , sans-serif",
        plusJakarta: "var(--font-plus-jakarta) , sans-serif",
        staatliches: "var(--font-staatliches) , sans-serif",
        geist: "var(--font-geist-mono) , monospaced",
        roboto: "var(--font-roboto) , sans-serif",
        publicSans: "var(--font-public-sans) , sans-serif",
        poppins: "var(--font-poppins) , sans-serif",
      },
    },
  },
  plugins: [],
};
export default config;
