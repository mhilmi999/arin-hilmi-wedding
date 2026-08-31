import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Manrope,
} from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Wedding of Arin & Hilmi",
  description:
    "Undangan pernikahan Nabilah Arina Khoirunnisa dan Muhammad Hilmi Ramadhan — 26 Desember 2026.",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${manrope.variable} ${cormorant.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}