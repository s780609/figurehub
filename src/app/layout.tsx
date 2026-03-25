import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { auth } from "@/lib/auth";
import GroupDropdown from "@/components/GroupDropdown";
import UserMenu from "@/components/UserMenu";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const slug = (session?.user as any)?.slug as string | undefined;

  const logoHref = session && slug ? `/u/${slug}` : "/";

  const userMenuData = session?.user
    ? {
        name: session.user.name ?? "",
        image: session.user.image ?? "",
        slug: slug ?? "",
      }
    : null;

  return (
    <html lang="zh-Hant">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-50 border-b border-[var(--card-border)] bg-[var(--background)]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
            <a href={logoHref} className="text-2xl font-bold tracking-tight">
              <span className="text-[var(--accent)]">Figure</span>Hub
            </a>
            <nav className="flex items-center gap-4">
              <GroupDropdown />
              <UserMenu user={userMenuData} />
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
