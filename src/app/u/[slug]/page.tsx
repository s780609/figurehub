import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getFiguresBySlug, getUserBySlug } from "@/data/figures";
import FigureList from "@/components/FigureList";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figurehub.xyz";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const user = await getUserBySlug(slug);
  if (!user) return { title: "找不到使用者" };

  return {
    title: `${user.name} 的模型收藏 - FigureHub`,
    description: `${user.name} 的二手模型收藏`,
    openGraph: {
      title: `${user.name} 的模型收藏 - FigureHub`,
      description: `${user.name} 的二手模型收藏`,
      url: `${SITE_URL}/u/${slug}`,
      siteName: "FigureHub",
    },
  };
}

export default async function UserStorePage({ params }: Props) {
  const { slug } = await params;
  const user = await getUserBySlug(slug);
  if (!user) notFound();

  const figures = await getFiguresBySlug(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${user.name} 的模型收藏`,
    url: `${SITE_URL}/u/${slug}`,
    numberOfItems: figures.length,
    itemListElement: figures.map((fig, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/u/${slug}/figure/${fig.id}`,
      name: fig.name,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          {user.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {user.name} 的模型收藏
          </h1>
        </div>
      </section>

      <Suspense>
        <FigureList figures={figures} basePath={`/u/${slug}`} />
      </Suspense>
    </div>
  );
}
