import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Corrected path if globals.css is in src/app

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reality Builder",
  description: "Automate VLESS+Reality VPN configurations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
