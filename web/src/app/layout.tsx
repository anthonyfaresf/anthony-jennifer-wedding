import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Tenor_Sans, Italianno } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const tenor = Tenor_Sans({
  variable: "--font-tenor",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const italianno = Italianno({
  variable: "--font-italianno",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anthony & Jennifer · 18 July 2026",
  description:
    "Anthony Fares Faraj and Jennifer Haddad invite you to celebrate their wedding at Couvent Saint Jean, Okaibe — 18 July 2026.",
  openGraph: {
    title: "Anthony & Jennifer · 18 July 2026",
    description: "Couvent Saint Jean, Okaibe — Lebanon",
    type: "website",
    locale: "en_US",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f4ece0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${tenor.variable} ${italianno.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
