import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata = {
  title: "TEZ International - Leadership Platform",
  description: "Secure organization hierarchy and business metrics management platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full dark`}>
      <body className="min-h-full flex flex-col bg-[#070a13] text-[#f3f4f6]">{children}</body>
    </html>
  );
}
