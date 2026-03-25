import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import GroupDropdown from "@/components/GroupDropdown";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figurehub.xyz";

export const metadata: Metadata = {
  title: "FigureHub - 二手模型專賣",
  description: "精選二手模型，拆擺品與全新未拆通通有",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "FigureHub - 二手模型專賣",
    description: "精選二手公仔與模型，拆擺品與全新未拆通通有",
    url: SITE_URL,
    siteName: "FigureHub",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <a href="/" className="text-2xl font-bold tracking-tight">
              <span className="text-[var(--accent)]">Figure</span>Hub
            </a>
            <nav className="flex items-center gap-4">
              <GroupDropdown />
              <span className="text-sm text-[var(--foreground)]/60">
                二手模型專賣
              </span>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
