"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import type { SoldFigure, SoldSort } from "@/data/figures";
import { loadSoldFigures } from "@/lib/actions";
import SkeletonImage from "./SkeletonImage";
import Spinner from "./Spinner";

const BOX_COLORS: Record<string, string> = {
  佳: "bg-emerald-600",
  普通: "bg-yellow-600",
  差: "bg-red-500",
  無盒: "bg-neutral-500",
};

interface Props {
  initialItems: SoldFigure[];
  initialHasMore: boolean;
}

export default function HomeFigureList({ initialItems, initialHasMore }: Props) {
  const [view, setView] = useState<"table" | "card">("table");
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [sort, setSort] = useState<SoldSort>("latest");
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // 每次送出請求遞增，用來丟棄過期（排序已切換）的回應
  const requestIdRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("home-view");
    if (saved === "card" || saved === "table") {
      setView(saved);
    } else {
      setView(window.innerWidth < 640 ? "card" : "table");
    }
  }, []);

  const changeView = (v: "table" | "card") => {
    setView(v);
    localStorage.setItem("home-view", v);
  };

  const loadMore = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setLoading(true);
    try {
      const res = await loadSoldFigures(items.length, sort);
      if (requestId !== requestIdRef.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((f) => f.id));
        return [...prev, ...res.items.filter((f) => !seen.has(f.id))];
      });
      setHasMore(res.hasMore);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }, [items.length, sort]);

  // 捲到底部附近時載入下一批
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  // 成交價格排序：低到高 → 高到低 → 取消（回到最新上架）
  const togglePriceSort = async () => {
    const next: SoldSort =
      sort === "latest" ? "priceAsc" : sort === "priceAsc" ? "priceDesc" : "latest";
    const requestId = ++requestIdRef.current;
    setSort(next);
    setLoading(true);
    try {
      const res = await loadSoldFigures(0, next);
      if (requestId !== requestIdRef.current) return;
      setItems(res.items);
      setHasMore(res.hasMore);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const sortIndicator =
    sort === "latest" ? (
      <span className="ml-1 text-[var(--foreground)]/30">↕</span>
    ) : (
      <span className="ml-1 text-[var(--accent)]">{sort === "priceAsc" ? "↑" : "↓"}</span>
    );

  if (items.length === 0 && !loading) {
    return <p className="text-center text-[var(--foreground)]/50">目前還沒有成交紀錄</p>;
  }

  return (
    <>
      {/* 切換按鈕 */}
      <div className="mb-4 flex justify-end">
        <div className="flex overflow-hidden rounded-lg border border-[var(--card-border)]">
          {(["table", "card"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => changeView(v)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
                view === v
                  ? "bg-[var(--accent)] text-white"
                  : "hover:bg-[var(--accent)]/10"
              }`}
            >
              {v === "table" ? "表格" : "卡片"}
            </button>
          ))}
        </div>
      </div>

      {/* 表格模式 */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
          <table className="w-full text-left text-base">
            <thead className="border-b border-[var(--card-border)] text-sm text-[var(--foreground)]/60">
              <tr>
                <th className="px-4 py-3 font-medium">模型名稱</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">狀況</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">銷售方式</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium">
                  <button
                    type="button"
                    onClick={togglePriceSort}
                    className="inline-flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    成交價格{sortIndicator}
                  </button>
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">賣家</th>
              </tr>
            </thead>
            <tbody>
              {items.map((fig) => (
                <tr
                  key={fig.id}
                  className="border-b border-[var(--card-border)] last:border-b-0"
                >
                  <td className="min-w-[200px] px-4 py-3">
                    <Link
                      href={`/figure/${fig.id}`}
                      className="font-medium hover:text-[var(--accent)] hover:underline"
                    >
                      {fig.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{fig.condition}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                        fig.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
                      }`}
                    >
                      {fig.saleMethod}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-[var(--accent)]">
                    NT${(fig.dealPrice ?? fig.price).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/u/${fig.sellerSlug}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {fig.sellerName}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 卡片模式 */}
      {view === "card" && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {items.map((fig) => (
            <Link
              key={fig.id}
              href={`/figure/${fig.id}`}
              className="group block overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* 主圖 */}
              <div className="relative aspect-square flex items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                {fig.imageUrl ? (
                  <SkeletonImage
                    src={fig.imageUrl}
                    alt={fig.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-[var(--foreground)]/20 text-4xl">?</div>
                )}
              </div>

              {/* 資訊 */}
              <div className="p-4">
                <h2 className="line-clamp-2 text-base font-semibold leading-snug">
                  {fig.name}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                      fig.condition === "全新未拆" ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
                    }`}
                  >
                    {fig.condition}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                      BOX_COLORS[fig.boxCondition]
                    }`}
                  >
                    盒況{fig.boxCondition}
                  </span>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                      fig.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
                    }`}
                  >
                    {fig.saleMethod}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-lg font-bold text-[var(--accent)]">
                    NT${(fig.dealPrice ?? fig.price).toLocaleString()}
                  </span>
                  <span className="truncate text-xs text-[var(--foreground)]/60">
                    {fig.sellerName}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* 無限捲動觸發點 */}
      <div ref={sentinelRef} className="flex justify-center py-6">
        {loading && <Spinner className="h-6 w-6" />}
      </div>
    </>
  );
}
