import { notFound } from "next/navigation";
import Link from "next/link";
import { figures } from "@/data/figures";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return figures.map((fig) => ({ id: fig.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const figure = figures.find((f) => f.id === id);
  if (!figure) return { title: "找不到模型" };
  return {
    title: `${figure.name} - FigureHub`,
    description: figure.description ?? `NT$${figure.price} / ${figure.condition}`,
  };
}

export default async function FigureDetailPage({ params }: Props) {
  const { id } = await params;
  const figure = figures.find((f) => f.id === id);
  if (!figure) notFound();

  const isNew = figure.condition === "全新未拆";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* 返回 */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
      >
        ← 回到列表
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
          <span className="text-2xl font-bold text-[var(--accent)]">
            NT${figure.price.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 說明 */}
      {figure.description && (
        <p className="mb-8 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4 leading-relaxed">
          {figure.description}
        </p>
      )}

      {/* 媒體 */}
      <div className="grid gap-4 sm:grid-cols-2">
        {figure.media.map((m, i) =>
          m.type === "image" ? (
            <div
              key={i}
              className="overflow-hidden rounded-lg border border-[var(--card-border)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={m.url}
                alt={`${figure.name} 照片 ${i + 1}`}
                className="h-auto w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div
              key={i}
              className="relative aspect-video overflow-hidden rounded-lg border border-[var(--card-border)]"
            >
              <iframe
                src={m.url}
                title={`${figure.name} 影片 ${i + 1}`}
                className="h-full w-full"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          )
        )}
      </div>
    </div>
  );
}
