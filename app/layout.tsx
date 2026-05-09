import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ChartFlow — Market Screener",
  description: "Professional stock screener and technical analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
