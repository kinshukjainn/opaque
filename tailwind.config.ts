// tailwind.config.ts
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
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
        staatliches: "var(--font-staatliches) , sans-serif",
        inter: "var(--font-inter) , sans-serif",
        publicSans: "var(--font-public-sans) , sans-serif",
        geist: "var(--font-geist-sans) , sans-serif",
        openSans: "var(--font-open-sans) , sans-serif",
        scienceGothic: "var(--font-science-gothic) , sans-serif",
        oxygen: "var(--font-oxygen) , sans-serif",
        plusJakarta: "var(--font-plus-jakarta) , sans-serif",
        roboto: "var(--font-roboto) , sans-serif",
        poppins: "var(--font-poppins) , sans-serif",
      },
    },
  },
  plugins: [typography],
};
export default config;
