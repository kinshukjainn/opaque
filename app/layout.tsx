import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Inter,
  Open_Sans,
  Plus_Jakarta_Sans,
  Poppins,
  Oxygen,
  Public_Sans,
  Roboto,
  Staatliches,
  Ubuntu,
  Science_Gothic,
} from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";
import ConditionalFooter from "./components/ConditionalFooter"; // <-- Import the new wrapper
import { ThemeProvider } from "./components/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const oxygen = Oxygen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-oxygen",
});

const ubuntu = Ubuntu({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-ubuntu",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-public-sans",
});

const staatliches = Staatliches({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-staatliches",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const scienceGothic = Science_Gothic({
  subsets: ["latin"],
  variable: "--font-science-gothic",
  display: "swap",
});

export const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "Opaque : Home",
  description:
    "Remember just one master password. We lock up the rest in a vault so secure, even we don't have the key to open it.",
  icons: {
    icon: "logo/logog.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        data-google-analytics-opt-out=""
        suppressHydrationWarning
        className={`${geistSans.variable} ${oxygen.variable} ${inter.variable} ${geistMono.variable} ${openSans.variable} ${staatliches.variable} ${scienceGothic.variable} ${poppins.variable} ${publicSans.variable} ${plusJakarta.variable} ${roboto.variable} ${ubuntu.variable} h-full antialiased`}
      >
        <body suppressHydrationWarning className="min-h-full flex flex-col">
          <ThemeProvider>
            <Header />
            {children}
            {/* Replace the standard Footer with the Conditional Footer */}
            <ConditionalFooter />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
