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
        <Header />
        <main className="min-h-[calc(100vh-7rem)]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
