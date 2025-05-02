import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BugTracker - Efficient Issue Management",
  description:
    "Track, manage, and resolve bugs efficiently with our powerful bug tracking platform",
  keywords: "bug tracking, issue management, software development",
  icons: {
    icon: "/favicon.ico",
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
          {children}
          <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
            <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
              <p>
                © {new Date().getFullYear()} BugTracker. All rights reserved.
              </p>
              <div className="flex justify-center space-x-4 mt-2">
                <a href="#" className="hover:text-purple-600 transition-colors">
                  Terms
                </a>
                <a href="#" className="hover:text-purple-600 transition-colors">
                  Privacy
                </a>
                <a href="#" className="hover:text-purple-600 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
