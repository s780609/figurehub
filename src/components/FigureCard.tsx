import Link from "next/link";
import type { Figure } from "@/data/figures";

export default function FigureCard({ figure }: { figure: Figure }) {
  const isNew = figure.condition === "全新未拆";

  return (
    <Link
      href={`/figure/${figure.id}`}
      className="group block overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      {/* 主圖 */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={figure.thumbnail}
          alt={figure.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* 資訊 */}
      <div className="p-4">
        <h2 className="line-clamp-2 text-sm font-semibold leading-snug">
          {figure.name}
        </h2>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              isNew ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
            }`}
          >
            {figure.condition}
          </span>
          <span className="ml-auto text-lg font-bold text-[var(--accent)]">
            NT${figure.price.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
