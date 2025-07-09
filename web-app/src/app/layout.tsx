import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext"; // Import LanguageProvider

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
    // LanguageProvider will set initial lang and dir on html tag via useEffect
    <html>
      <body className={inter.className}>
        <AuthProvider>
          <LanguageProvider> {/* Wrap AuthProvider (or its children) with LanguageProvider */}
            {children}
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
