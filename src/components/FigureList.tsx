"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { Figure, SoldStatus, SaleMethod } from "@/data/figures";
import FigureCard from "./FigureCard";

type SoldFilter = SoldStatus | "all";
type SaleFilter = SaleMethod | "all";

export default function FigureList({ figures }: { figures: Figure[] }) {
  const searchParams = useSearchParams();

  const [soldFilter, setSoldFilter] = useState<SoldFilter>(() => {
    const v = searchParams.get("soldStatus");
    if (v === "未售出" || v === "準備中" || v === "已售出" || v === "all") return v;
    return "未售出";
  });

  const [saleFilter, setSaleFilter] = useState<SaleFilter>(() => {
    const v = searchParams.get("saleMethod");
    if (v === "出售" || v === "競標" || v === "all") return v;
    return "all";
  });

  // 同步 URL query string
  useEffect(() => {
    const params = new URLSearchParams();
    if (soldFilter !== "未售出") params.set("soldStatus", soldFilter);
    if (saleFilter !== "all") params.set("saleMethod", saleFilter);
    const qs = params.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [soldFilter, saleFilter]);

  const filtered = figures.filter((f) => {
    if (soldFilter !== "all" && f.soldStatus !== soldFilter) return false;
    if (saleFilter !== "all" && f.saleMethod !== saleFilter) return false;
    return true;
  });

  return (
    <>
      {/* 過濾器 */}
      <div className="mb-6 flex justify-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--foreground)]/60">售出狀態</label>
          <select
            value={soldFilter}
            onChange={(e) => setSoldFilter(e.target.value as SoldFilter)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="未售出">未售出</option>
            <option value="準備中">準備中</option>
            <option value="已售出">已售出</option>
            <option value="all">全部</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--foreground)]/60">銷售方式</label>
          <select
            value={saleFilter}
            onChange={(e) => setSaleFilter(e.target.value as SaleFilter)}
            className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="all">全部</option>
            <option value="出售">出售</option>
            <option value="競標">競標</option>
          </select>
        </div>
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
