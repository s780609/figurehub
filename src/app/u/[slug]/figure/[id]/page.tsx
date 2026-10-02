import { notFound } from "next/navigation";
import { getFigureById, getUserBySlug } from "@/data/figures";
import type { Metadata } from "next";
import FigureDetail from "@/components/FigureDetail";

type Props = { params: Promise<{ slug: string; id: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figurehub.xyz";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const figure = await getFigureById(id);
  if (!figure) return { title: "找不到模型" };

  const title = `${figure.name} - FigureHub`;
  const description = figure.description ?? `NT$${figure.price} / ${figure.condition}`;
  const firstImage = figure.media.find((m) => m.type === "image");
  const ogImage = firstImage ? `${SITE_URL}${firstImage.url}` : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/u/${slug}/figure/${id}`,
      siteName: "FigureHub",
      ...(ogImage && { images: [{ url: ogImage, width: 800, height: 800 }] }),
    },
  };
}

export default async function UserFigureDetailPage({ params }: Props) {
  const { slug, id } = await params;

  // 驗證 user 和 figure 存在，且 figure 屬於該 user
  const user = await getUserBySlug(slug);
  if (!user) notFound();

  const figure = await getFigureById(id);
  if (!figure || figure.userId !== user.id) notFound();

  return (
    <FigureDetail
      figure={figure}
      seller={user}
      backHref={`/u/${slug}`}
      backLabel={`回到 ${user.name} 的收藏`}
    />
  );
}
