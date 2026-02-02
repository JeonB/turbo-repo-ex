import "@repo/ui/styles.css";
import "./globals.css";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Turbo Repo — Monorepo",
  description: "Monorepo example with Turborepo, shared UI, and apps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.className}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline-none focus:ring-2 focus:ring-blue-1000"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main-content" className="min-h-[calc(100vh-7rem)]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
