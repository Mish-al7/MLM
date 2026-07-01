import { Inter, Cinzel } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata = {
  title: "Allianza - Leadership Platform",
  description: "Secure organization hierarchy and business metrics management platform.",
  icons: {
    icon: "/logoallianza.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable} h-full`}>
      <head>
        <Script id="release-pointer-capture-patch" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined' && Element.prototype.releasePointerCapture) {
              const originalRelease = Element.prototype.releasePointerCapture;
              Element.prototype.releasePointerCapture = function(pointerId) {
                try {
                  originalRelease.call(this, pointerId);
                } catch (e) {
                  if (e.name !== 'NotFoundError') {
                    throw e;
                  }
                }
              };
            }
          `}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
