"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { PreorderFigure } from "@/data/preorders";

interface Props {
  preorders: PreorderFigure[];
}

const MONTH_LABELS = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export default function PreorderTimeline({ preorders }: Props) {
  // 只取未到貨
  const unshipped = useMemo(() => preorders.filter((p) => !p.arrived), [preorders]);

  // 取得所有可用年份，排序
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const p of unshipped) {
      const y = parseInt(p.releaseDate.split("-")[0], 10);
      if (!isNaN(y)) set.add(y);
    }
    const arr = Array.from(set).sort();
    if (arr.length === 0) arr.push(new Date().getFullYear());
    return arr;
  }, [unshipped]);

  const [selectedYear, setSelectedYear] = useState(() => {
    const current = new Date().getFullYear();
    return years.includes(current) ? current : years[0];
  });

  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  // 按月份分組
  const monthData = useMemo(() => {
    const map = new Map<number, PreorderFigure[]>();
    for (const p of unshipped) {
      const [yStr, mStr] = p.releaseDate.split("-");
      const y = parseInt(yStr, 10);
      const m = parseInt(mStr, 10);
      if (y !== selectedYear) continue;
      if (!map.has(m)) map.set(m, []);
      map.get(m)!.push(p);
    }
    return map;
  }, [unshipped, selectedYear]);

  const yearTotal = useMemo(() => {
    let count = 0;
    let amount = 0;
    for (const items of monthData.values()) {
      count += items.length;
      amount += items.reduce((s, p) => s + p.price, 0);
    }
    return { count, amount };
  }, [monthData]);

  // 找出金額最高的月份，用來算進度條比例
  const maxMonthAmount = useMemo(() => {
    let max = 0;
    for (const items of monthData.values()) {
      const total = items.reduce((s, p) => s + p.price, 0);
      if (total > max) max = total;
    }
    return max;
  }, [monthData]);

  const toggleMonth = (m: number) => {
    setExpandedMonth(expandedMonth === m ? null : m);
  };

  if (unshipped.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-8 text-center text-[var(--foreground)]/40">
        所有預購模型皆已到貨！
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      {/* 標題列 + 年份選擇 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">未到貨進度總覽</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            {selectedYear} 年共
            <span className="mx-1 font-bold text-amber-500">{yearTotal.count}</span>
            筆未到貨，合計
            <span className="ml-1 font-bold text-amber-500">NT${yearTotal.amount.toLocaleString()}</span>
          </p>
        </div>
        <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden text-sm">
          {years.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => { setSelectedYear(y); setExpandedMonth(null); }}
              className={`px-4 py-1.5 font-medium transition-colors ${
                selectedYear === y
                  ? "bg-[var(--accent)] text-white"
                  : "hover:bg-[var(--accent)]/10"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* 12 月份 Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
          const items = monthData.get(m) || [];
          const count = items.length;
          const amount = items.reduce((s, p) => s + p.price, 0);
          const hasData = count > 0;
          const isExpanded = expandedMonth === m;
          const barWidth = maxMonthAmount > 0 ? (amount / maxMonthAmount) * 100 : 0;

          return (
            <button
              key={m}
              type="button"
              onClick={() => hasData && toggleMonth(m)}
              className={`relative flex flex-col rounded-lg border p-3 text-left transition-all ${
                hasData
                  ? isExpanded
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-md"
                    : "border-[var(--card-border)] hover:border-[var(--accent)]/50 hover:shadow-sm cursor-pointer"
                  : "border-[var(--card-border)] opacity-40 cursor-default"
              }`}
            >
              <span className={`text-sm font-bold ${hasData ? "text-[var(--foreground)]" : "text-[var(--foreground)]/40"}`}>
                {MONTH_LABELS[m - 1]}
              </span>
              {hasData ? (
                <>
                  <span className="mt-1 text-lg font-bold text-[var(--accent)]">
                    {count}<span className="text-xs font-normal ml-0.5">筆</span>
                  </span>
                  <span className="text-xs text-[var(--foreground)]/60">
                    NT${amount.toLocaleString()}
                  </span>
                  {/* 金額比例條 */}
                  <div className="mt-2 h-1.5 w-full rounded-full bg-[var(--foreground)]/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </>
              ) : (
                <span className="mt-1 text-xs text-[var(--foreground)]/30">無資料</span>
              )}
            </button>
          );
        })}
      </div>

      {/* 展開的月份明細 */}
      {expandedMonth !== null && (monthData.get(expandedMonth) || []).length > 0 && (
        <div className="mt-4 rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 animate-in fade-in duration-200">
          <h3 className="mb-3 text-sm font-bold text-[var(--accent)]">
            {selectedYear} 年 {MONTH_LABELS[expandedMonth - 1]} — 未到貨模型
          </h3>
          <div className="space-y-2">
            {(monthData.get(expandedMonth) || []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-snug">{p.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="inline-block rounded-full bg-gray-500 px-2 py-0.5 text-xs font-medium text-white">
                      {p.store}
                    </span>
                    <span className="inline-block rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
                      {p.platform}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-base font-bold text-[var(--accent)]">
                    NT${p.price.toLocaleString()}
                  </span>
                  <Link
                    href={`/admin/preorders/${p.id}/edit`}
                    className="rounded bg-[var(--accent)] px-2.5 py-1 text-xs font-bold text-white hover:opacity-80 transition-colors"
                  >
                    查看
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t border-[var(--accent)]/20 pt-2 text-right text-sm font-bold text-[var(--foreground)]/60">
            小計：NT${(monthData.get(expandedMonth) || []).reduce((s, p) => s + p.price, 0).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
