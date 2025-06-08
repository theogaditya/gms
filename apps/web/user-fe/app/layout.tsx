
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header1 } from "@/components/header";
import { Footer7 } from "@/components/ui/footer-7";

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
    <html lang="en" >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full`}>   
        <div> 
          <Header1></Header1>
        </div>
        {children}
        <div>
          <Footer7></Footer7>
        </div>
      </body>
    </html>
  );
}
