"use client";

import { useState } from "react";
import type { Figure, SoldStatus } from "@/data/figures";
import FigureCard from "./FigureCard";

const FILTERS: { label: string; value: SoldStatus | "all" }[] = [
  { label: "未售出", value: "未售出" },
  { label: "準備中", value: "準備中" },
  { label: "已售出", value: "已售出" },
  { label: "全部", value: "all" },
];

export default function FigureList({ figures }: { figures: Figure[] }) {
  const [filter, setFilter] = useState<SoldStatus | "all">("未售出");

  const filtered =
    filter === "all"
      ? figures
      : figures.filter((f) => f.soldStatus === filter);

  return (
    <>
      {/* 過濾器 */}
      <div className="mb-6 flex justify-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f.value
                ? "bg-[var(--accent)] text-white"
                : "border border-[var(--card-border)] hover:border-[var(--accent)]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 模型列表 */}
      {filtered.length === 0 ? (
        <p className="text-center text-[var(--foreground)]/40">
          目前沒有符合條件的模型
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {filtered.map((fig) => (
            <FigureCard key={fig.id} figure={fig} />
          ))}
        </div>
      )}
    </>
  );
}
