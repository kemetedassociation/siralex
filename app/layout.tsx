import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SiraLex — La voie du droit en Afrique francophone",
  description:
    "SiraLex rassemble formation, documentation juridique, examens et communauté pour les étudiants, enseignants et professionnels du droit sénégalais et OHADA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-black/10 bg-white py-8 text-sm text-foreground/60">
          <div className="mx-auto max-w-6xl px-4">
            <p>SiraLex — La voie du droit en Afrique francophone.</p>
            <p className="mt-1">
              Phase 1 : Sénégal. MVP de démonstration — contenus juridiques fournis à titre
              d&apos;exemple et non opposables.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
