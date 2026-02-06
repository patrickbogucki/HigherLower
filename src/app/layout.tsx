import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Higher or Lower - Design Concepts",
  description: "Five unique front-end design concepts for the Higher or Lower multiplayer game",
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
