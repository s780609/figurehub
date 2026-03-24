import { notFound } from "next/navigation";
import Link from "next/link";
import { getFigureById } from "@/data/figures";
import type { Metadata } from "next";

const BOX_COLORS: Record<string, string> = {
  佳: "bg-emerald-600",
  普通: "bg-yellow-600",
  差: "bg-red-500",
  無盒: "bg-neutral-500",
};

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const figure = await getFigureById(id);
  if (!figure) return { title: "找不到模型" };
  return {
    title: `${figure.name} - FigureHub`,
    description: figure.description ?? `NT$${figure.price} / ${figure.condition}`,
  };
}

export default async function FigureDetailPage({ params }: Props) {
  const { id } = await params;
  const figure = await getFigureById(id);
  if (!figure) notFound();

  const isNew = figure.condition === "全新未拆";
  const images = figure.media.filter((m) => m.type === "image");
  const videos = figure.media.filter((m) => m.type === "video");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 返回 */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
      >
        &larr; 回到列表
      </Link>

      {/* 標題區 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">{figure.name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium text-white ${
              isNew ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
            }`}
          >
            {figure.condition}
          </span>
          <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-medium text-white ${
              BOX_COLORS[figure.boxCondition]
            }`}
          >
            盒況{figure.boxCondition}
          </span>
          <span className="inline-block rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
            {figure.shippingMethod}
          </span>
          {figure.sold && (
            <span className="inline-block rounded-full bg-red-600 px-3 py-1 text-sm font-bold text-white">
              已售出
            </span>
          )}
          <span className="text-2xl font-bold text-[var(--accent)]">
            NT${figure.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 銷售方式 Bar */}
      <div className="mb-6 flex items-center gap-0 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] text-sm overflow-hidden">
        <div
          className={`px-4 py-2.5 font-medium text-white ${
            figure.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
          }`}
        >
          {figure.saleMethod}
        </div>
        {figure.saleMethod === "競標" && (
          <div className="px-4 py-2.5 text-[var(--foreground)]/80">
            結標時間: {figure.bidEndTime ?? "請見貼文"}
          </div>
        )}
      </div>

      {/* 說明 */}
      {figure.description && (
        <p className="mb-8 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 leading-relaxed">
          {figure.description}
        </p>
      )}

      {/* 照片 */}
      {images.length > 0 && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {images.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-center overflow-hidden rounded-lg border border-[var(--card-border)] bg-neutral-100 dark:bg-neutral-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={`${figure.name} 照片 ${i + 1}`}
                className="max-w-full h-auto object-contain"
                loading={i === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      )}

      {/* 影片 */}
      {videos.length > 0 && (
        <div className="mb-6 grid gap-4">
          {videos.map((m, i) => (
            <div
              key={i}
              className="relative w-full overflow-hidden rounded-lg border border-[var(--card-border)]"
              style={{ paddingBottom: "56.25%" }}
            >
              <iframe
                src={m.url}
                title={`${figure.name} 影片 ${i + 1}`}
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
