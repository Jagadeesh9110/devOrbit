import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import FooterSection from "@/components/layout/footer/FooterSection";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BugTracker - Efficient Issue Management",
  description:
    "Track, manage, and resolve bugs efficiently with our powerful bug tracking platform",
  keywords: "bug tracking, issue management, software development",
  icons: {
    icon: "/devOrbit-logo.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}
      >
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col pt-[64px]">
            {children}
          </main>{" "}
          <FooterSection />
        </div>

        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
