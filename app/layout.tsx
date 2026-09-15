import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { PermanentBanner } from "@/components/ui";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Rendu dynamique requis pour le nonce CSP (proxy.ts).
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "hepato-renal — mesure de l'index hépato-rénal",
  description: "Outil de mesure de l'index hépato-rénal sur image échographique, 100 % dans le navigateur. Pas un dispositif médical.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "hepato-renal" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0e1113",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <PermanentBanner />
        <header className="w-full border-b border-line">
          <nav className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-4 text-[14px]">
            <Link href="/" className="font-bold tracking-tight text-[16px]">hepato-renal</Link>
            <span className="text-dim">·</span>
            <Link href="/mesure" className="text-muted hover:text-text">Mesurer</Link>
            <Link href="/limites" className="text-muted hover:text-text">Limites et fiabilité</Link>
            <Link href="/references" className="text-muted hover:text-text">Références</Link>
          </nav>
        </header>
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 safe-bottom">{children}</main>
        <footer className="w-full border-t border-line text-[12px] text-muted px-4 py-3 text-center">
          Code source libre (MIT) · Aucune donnée ne quitte votre appareil · Version 0.1.0
        </footer>
      </body>
    </html>
  );
}
