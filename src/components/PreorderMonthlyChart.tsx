"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PreorderFigure } from "@/data/preorders";

type FilterMode = "all" | "unshipped" | "shipped";

interface Props {
  preorders: PreorderFigure[];
}

export default function PreorderMonthlyChart({ preorders }: Props) {
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered =
    filter === "all"
      ? preorders
      : filter === "shipped"
        ? preorders.filter((p) => p.arrived)
        : preorders.filter((p) => !p.arrived);

  // 按月份彙總金額
  const monthMap = new Map<string, number>();
  for (const p of filtered) {
    const key = p.releaseDate; // already "YYYY-MM"
    monthMap.set(key, (monthMap.get(key) ?? 0) + p.price);
  }

  const data = Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, total]) => ({ month, total }));

  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-[var(--foreground)]/40">
        無資料可顯示
      </p>
    );
  }

  const colors = [
    "#6366f1", "#818cf8", "#a78bfa", "#c084fc",
    "#f472b6", "#fb923c", "#facc15", "#4ade80",
    "#22d3ee", "#60a5fa",
  ];

  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">每月預購金額</h2>
        <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden text-sm">
          {([["all", "全部"], ["unshipped", "未到貨"], ["shipped", "已到貨"]] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 font-medium transition-colors ${
                filter === key
                  ? key === "shipped"
                    ? "bg-emerald-600 text-white"
                    : key === "unshipped"
                      ? "bg-amber-500 text-white"
                      : "bg-[var(--accent)] text-white"
                  : "hover:bg-[var(--accent)]/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v: number) => `$${v.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value) => [
                `NT$${Number(value).toLocaleString()}`,
                "金額",
              ]}
              contentStyle={{
                background: "#ffffff",
                color: "#171717",
                border: "1px solid #e5e5e5",
                borderRadius: 8,
              }}
            />
            <Bar dataKey="total" radius={[4, 4, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
