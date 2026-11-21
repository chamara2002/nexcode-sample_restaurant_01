import type { Metadata, Viewport } from "next";
import "@fontsource/abhaya-libre/400.css";
import "@fontsource/abhaya-libre/600.css";
import "@fontsource/abhaya-libre/800.css";
import "@fontsource-variable/instrument-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pahana | Sri Lankan kitchen",
  description: "Village-style Sri Lankan rice and curry, hoppers and kottu cooked on a wood fire. Book a table on WhatsApp.",
};

export const viewport: Viewport = { themeColor: "#141a3a" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-lang="en">
      <body>{children}</body>
    </html>
  );
}
