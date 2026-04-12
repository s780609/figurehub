"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { PreorderFigure } from "@/data/preorders";

type SortKey = "releaseDate" | "price" | "arrived";
type SortDir = "asc" | "desc";

const PreorderMonthlyChart = dynamic(
  () => import("@/components/PreorderMonthlyChart"),
  { ssr: false }
);

interface Props {
  preorders: PreorderFigure[];
  deleteAction: (id: string) => Promise<void>;
  toggleArrivedAction: (id: string) => Promise<void>;
}

export default function AdminPreorderList({ preorders, deleteAction, toggleArrivedAction }: Props) {
  const [view, setView] = useState<"table" | "card">("table");
  const [showChart, setShowChart] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const totalPrice = preorders.reduce((sum, p) => sum + p.price, 0);
  const shippedPrice = preorders.filter(p => p.arrived).reduce((sum, p) => sum + p.price, 0);
  const unshippedPrice = preorders.filter(p => !p.arrived).reduce((sum, p) => sum + p.price, 0);

  const sortedPreorders = useMemo(() => {
    if (!sortKey) return preorders;
    const arr = [...preorders];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "releaseDate") {
        cmp = (a.releaseDate || "").localeCompare(b.releaseDate || "");
      } else if (sortKey === "price") {
        cmp = a.price - b.price;
      } else if (sortKey === "arrived") {
        cmp = Number(a.arrived) - Number(b.arrived);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [preorders, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortKey(null);
        setSortDir("asc");
      }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return <span className="ml-1 text-[var(--foreground)]/30">↕</span>;
    return <span className="ml-1 text-[var(--accent)]">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  useEffect(() => {
    const saved = localStorage.getItem("admin-preorder-view");
    if (saved === "card" || saved === "table") {
      setView(saved);
    } else {
      setView(window.innerWidth < 640 ? "card" : "table");
    }
    setMounted(true);
  }, []);

  const changeView = (v: "table" | "card") => {
    setView(v);
    localStorage.setItem("admin-preorder-view", v);
  };

  if (preorders.length === 0) {
    return (
      <p className="text-center text-[var(--foreground)]/40 py-12">
        尚無預購模型資料
      </p>
    );
  }

  return (
    <>
      {/* 總金額 + 圖表切換 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="text-lg font-bold">
          預購總金額：<span className="text-[var(--accent)]">NT${totalPrice.toLocaleString()}</span>
        </span>
        <span className="text-sm text-[var(--foreground)]/60">
          未到貨 <span className="font-bold text-amber-500">NT${unshippedPrice.toLocaleString()}</span>
          ｜已到貨 <span className="font-bold text-emerald-500">NT${shippedPrice.toLocaleString()}</span>
        </span>
        <button
          type="button"
          onClick={() => setShowChart(!showChart)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
            showChart
              ? "border-[var(--accent)] bg-[var(--accent)] text-white"
              : "border-[var(--card-border)] hover:bg-[var(--accent)]/10"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {showChart ? "隱藏圖表" : "月份圖表"}
        </button>
      </div>

      {/* 月份圖表 */}
      {showChart && (
        <div className="mb-4">
          <PreorderMonthlyChart preorders={preorders} />
        </div>
      )}

      {/* 切換按鈕 */}
      <div className="mb-4 flex justify-end">
        <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden">
          <button
            type="button"
            onClick={() => changeView("table")}
            className={`flex items-center gap-2 px-8 py-2.5 text-base font-medium tracking-wide transition-colors ${
              view === "table"
                ? "bg-[var(--accent)] text-white"
                : "hover:bg-[var(--accent)]/10"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12h-7.5c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125" />
            </svg>
            表格
          </button>
          <button
            type="button"
            onClick={() => changeView("card")}
            className={`flex items-center gap-2 px-8 py-2.5 text-base font-medium tracking-wide transition-colors ${
              view === "card"
                ? "bg-[var(--accent)] text-white"
                : "hover:bg-[var(--accent)]/10"
            }`}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" />
            </svg>
            卡片
          </button>
        </div>
      </div>

      {/* 表格模式 */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
          <table className="min-w-[900px] w-full text-left text-base">
            <thead className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
              <tr>
                <th className="px-4 py-3 font-medium min-w-[200px]">名稱</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("releaseDate")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    發售日期{sortIndicator("releaseDate")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("price")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    預購金額{sortIndicator("price")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">預購店家</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">預購平台</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("arrived")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    到貨狀態{sortIndicator("arrived")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedPreorders.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-[var(--card-border)] last:border-0 ${i % 2 === 1 ? "bg-[var(--card-bg)]" : ""}`}
                >
                  <td className="px-4 py-3 font-medium break-words">{p.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.releaseDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    NT${p.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.store}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{p.platform}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ArrivedToggle id={p.id} arrived={p.arrived} toggleAction={toggleArrivedAction} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Actions id={p.id} deleteAction={deleteAction} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 卡片模式 */}
      {view === "card" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {sortedPreorders.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden"
            >
              <div className="flex-1 p-4">
                <h3 className="mb-2 font-medium leading-snug">{p.name}</h3>
                <div className="mb-3 text-lg font-bold text-[var(--accent)]">
                  NT${p.price.toLocaleString()}
                </div>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <span className="inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                    {p.releaseDate}
                  </span>
                  <span className="inline-block rounded-full bg-gray-500 px-2 py-0.5 text-xs font-medium text-white">
                    {p.store}
                  </span>
                  <span className="inline-block rounded-full bg-purple-500 px-2 py-0.5 text-xs font-medium text-white">
                    {p.platform}
                  </span>
                </div>
                <div>
                  <ArrivedToggle id={p.id} arrived={p.arrived} toggleAction={toggleArrivedAction} />
                </div>
              </div>
              <CardActions id={p.id} deleteAction={deleteAction} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ArrivedToggle({
  id,
  arrived,
  toggleAction,
}: {
  id: string;
  arrived: boolean;
  toggleAction: (id: string) => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="button"
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await toggleAction(id);
        setLoading(false);
      }}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white transition-colors cursor-pointer ${
        arrived
          ? "bg-emerald-600 hover:bg-emerald-700"
          : "bg-gray-400 hover:bg-gray-500"
      } ${loading ? "opacity-50" : ""}`}
    >
      {loading ? (
        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {arrived ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
          )}
        </svg>
      )}
      {arrived ? "已到貨" : "未到貨"}
    </button>
  );
}

function Actions({
  id,
  deleteAction,
}: {
  id: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/preorders/${id}/edit`}
        className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-bold text-white hover:opacity-80 transition-colors"
      >
        編輯
      </Link>
      <button
        type="button"
        onClick={() => {
          if (confirm("確定要刪除這筆預購模型資料嗎？")) deleteAction(id);
        }}
        className="rounded bg-red-500 px-3 py-1.5 text-sm font-bold text-white hover:opacity-80 transition-colors"
      >
        刪除
      </button>
    </div>
  );
}

function CardActions({
  id,
  deleteAction,
}: {
  id: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  return (
    <div className="flex border-t border-[var(--card-border)]">
      <Link
        href={`/admin/preorders/${id}/edit`}
        className="flex-1 py-3 text-center text-base font-bold tracking-widest bg-[var(--accent)] text-white hover:opacity-80 transition-colors"
      >
        編輯
      </Link>
      <button
        type="button"
        onClick={() => {
          if (confirm("確定要刪除這筆預購模型資料嗎？")) deleteAction(id);
        }}
        className="flex-1 py-3 text-center text-base font-bold tracking-widest bg-red-500 text-white hover:opacity-80 transition-colors"
      >
        刪除
      </button>
    </div>
  );
}
