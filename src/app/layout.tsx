import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Higher or Lower",
  description: "The refined art of prediction. Outlast your rivals in the ultimate game of intuition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
