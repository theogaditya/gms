import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css"; // Make sure your CSS is imported!
import { Header1 } from "@/components/header";
import { Footer7 } from "@/components/ui/footer-7";
import LanguageSelector from "@/components/lang"; // Your component

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwarajDesk",
  description: "SwarajDesk: Voice your issue",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full`}
      >
        <header>
          <div>
            <Header1></Header1>
          </div>
        </header>
        {children}
        <footer className="bg-gray-50 dark:bg-gray-900 py-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-between items-center">
              <LanguageSelector></LanguageSelector>
            </div>
            <Footer7></Footer7>
          </div>
        </footer>
      </body>
    </html>
  );
}