import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Open_Sans,
  Plus_Jakarta_Sans,
  Poppins,
  Public_Sans,
  Roboto,
  Staatliches,
  Ubuntu,
} from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "./components/Header";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
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

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${staatliches.variable}  ${poppins.variable} ${publicSans.variable} ${plusJakarta.variable} ${roboto.variable} ${ubuntu.variable} h-full antialiased`}
      >
        <body suppressHydrationWarning className="min-h-full flex flex-col">
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
