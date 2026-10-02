import { notFound } from "next/navigation";
import { getFigureById, getUserById } from "@/data/figures";
import type { Metadata } from "next";
import FigureDetail from "@/components/FigureDetail";

type Props = { params: Promise<{ id: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figurehub.xyz";

// 首頁用的模型詳情頁：內容與賣場詳情頁相同，返回連結回首頁
async function getFigureWithSeller(id: string) {
  const figure = await getFigureById(id);
  if (!figure?.userId) return null;
  const seller = await getUserById(figure.userId);
  if (!seller) return null;
  return { figure, seller };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getFigureWithSeller(id);
  if (!data) return { title: "找不到模型" };
  const { figure, seller } = data;

  const title = `${figure.name} - FigureHub`;
  const description = figure.description ?? `NT$${figure.price} / ${figure.condition}`;
  const firstImage = figure.media.find((m) => m.type === "image");
  const ogImage = firstImage ? `${SITE_URL}${firstImage.url}` : undefined;
  // 與賣場詳情頁內容重複，canonical 指回賣場網址
  const canonical = `${SITE_URL}/u/${seller.slug}/figure/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "FigureHub",
      ...(ogImage && { images: [{ url: ogImage, width: 800, height: 800 }] }),
    },
  };
}

export default async function HomeFigureDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getFigureWithSeller(id);
  if (!data) notFound();

  return (
    <FigureDetail
      figure={data.figure}
      seller={data.seller}
      backHref="/"
      backLabel="回到首頁"
    />
  );
}
