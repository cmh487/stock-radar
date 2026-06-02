import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StockRadar - US Stock Discovery",
  description: "Beginner-friendly US stock discovery and tracking tool",
};

function Nav() {
  return (
    <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
        <Link href="/" className="font-bold text-lg text-white">
          StockRadar
        </Link>
        <div className="flex gap-4 text-sm">
          <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/discover" className="text-zinc-400 hover:text-white transition-colors">
            Discover
          </Link>
          <Link href="/watchlist" className="text-zinc-400 hover:text-white transition-colors">
            Watchlist
          </Link>
          <Link href="/alerts" className="text-zinc-400 hover:text-white transition-colors">
            Alerts
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 py-4 px-4">
      <p className="text-xs text-zinc-500 text-center max-w-2xl mx-auto">
        StockRadar is an educational tool. This is NOT financial advice.
        Always do your own research before investing. Market data provided by Longbridge.
      </p>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white">
        <Providers>
          <Nav />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
