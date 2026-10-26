import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Next.js font optimization
import "./globals.css";
import Navbar from "./Navbar";

// 1. Initialize the font with 'swap' to prevent invisible text during page load
const inter = Inter({ subsets: ["latin"], display: 'swap' });

// 2. Optimize SEO and Social Sharing Metadata
export const metadata: Metadata = {
  // Updated title to match the "Nova Fragrance" branding seen in your UI
  title: "Nova Fragrance | Premium Luxury", 
  description: "An architectural approach to sensory design. High-end corporate and evening fragrance collections.",
  openGraph: {
    title: "Nova Fragrance | The Monolith Collection",
    description: "An architectural approach to sensory design. Dark wood, crushed amber, smoked vetiver.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 3. suppressHydrationWarning prevents React from crashing if a user has 
    // Chrome extensions (like Grammarly or Dark Reader) that inject code into the HTML
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-[#0a0a0a] text-[#f5f5f5]`}>
        {/* 4. Global Navigation Mounted Once */}
        <Navbar />
        
        {/* 5. Main Content Area */}
        <main className="flex-grow relative">
          {children}
        </main>
      </body>
    </html>
  );
}