import Link from "next/link";
import type { Figure } from "@/data/figures";

const BOX_COLORS: Record<string, string> = {
  佳: "bg-emerald-600",
  普通: "bg-yellow-600",
  差: "bg-red-500",
  無盒: "bg-neutral-500",
};

export default function FigureCard({ figure }: { figure: Figure }) {
  const isNew = figure.condition === "全新未拆";
  const firstImage = figure.media.find((m) => m.type === "image");

  return (
    <Link
      href={`/figure/${figure.id}`}
      className="group block overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* 主圖 */}
      <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {firstImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={firstImage.url}
            alt={figure.name}
            className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-[var(--foreground)]/20 text-4xl">?</div>
        )}
      </div>

      {/* 資訊 */}
      <div className="p-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
          {figure.name}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              isNew ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
            }`}
          >
            {figure.condition}
          </span>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              BOX_COLORS[figure.boxCondition]
            }`}
          >
            盒況{figure.boxCondition}
          </span>
          <span className="inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
            {figure.shippingMethod}
          </span>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              figure.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
            }`}
          >
            {figure.saleMethod}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-[var(--accent)]">
            NT${figure.price.toLocaleString()}
          </span>
          {figure.sold && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
              已售出
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
