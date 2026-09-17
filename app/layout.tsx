import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { InstallServiceWorker } from "@/components/install-service-worker";

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
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: ["/icons/favicon-32.png"],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SiraLex",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b2740",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <InstallServiceWorker />
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
