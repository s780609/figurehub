"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { PreorderFigure } from "@/data/preorders";
import Spinner from "./Spinner";

type SortKey = "name" | "releaseDate" | "price" | "store" | "platform" | "arrived";
type SortDir = "asc" | "desc";

const PreorderMonthlyChart = dynamic(
  () => import("@/components/PreorderMonthlyChart"),
  { ssr: false }
);

const PreorderTimeline = dynamic(
  () => import("@/components/PreorderTimeline"),
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
  const [showTimeline, setShowTimeline] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>("arrived");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const totalPrice = preorders.reduce((sum, p) => sum + p.price, 0);
  const shippedCount = preorders.filter(p => p.arrived).length;
  const unshippedCount = preorders.filter(p => !p.arrived).length;
  const shippedPrice = preorders.filter(p => p.arrived).reduce((sum, p) => sum + p.price, 0);
  const unshippedPrice = preorders.filter(p => !p.arrived).reduce((sum, p) => sum + p.price, 0);

  const sortedPreorders = useMemo(() => {
    if (!sortKey) return preorders;
    const arr = [...preorders];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "zh-Hant");
      } else if (sortKey === "releaseDate") {
        cmp = (a.releaseDate || "").localeCompare(b.releaseDate || "");
      } else if (sortKey === "price") {
        cmp = a.price - b.price;
      } else if (sortKey === "store") {
        cmp = a.store.localeCompare(b.store, "zh-Hant");
      } else if (sortKey === "platform") {
        cmp = a.platform.localeCompare(b.platform, "zh-Hant");
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
      {/* 統計卡片 */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="relative overflow-hidden rounded-lg bg-[var(--card-bg)] p-4 pl-5 border-l-[3px] border-l-[var(--accent)]">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" /></svg>
            預購總金額
          </p>
          <p className="text-xl font-bold text-[var(--accent)]">NT${totalPrice.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40"><span className="font-bold">{preorders.length}</span> 件預購</p>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-[var(--card-bg)] p-4 pl-5 border-l-[3px] border-l-amber-500">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            未到貨
          </p>
          <p className="text-xl font-bold text-amber-500">NT${unshippedPrice.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40"><span className="font-bold">{unshippedCount}</span> 件等待中</p>
        </div>
        <div className="relative overflow-hidden rounded-lg bg-[var(--card-bg)] p-4 pl-5 border-l-[3px] border-l-emerald-500">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            已到貨
          </p>
          <p className="text-xl font-bold text-emerald-500">NT${shippedPrice.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40"><span className="font-bold">{shippedCount}</span> 件已完成</p>
        </div>
      </div>

      {/* 工具列 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
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
          <button
            type="button"
            onClick={() => setShowTimeline(!showTimeline)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              showTimeline
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-[var(--card-border)] hover:bg-amber-500/10"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {showTimeline ? "隱藏進度" : "到貨進度"}
          </button>
        </div>
        <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden">
          <button
            type="button"
            onClick={() => changeView("table")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "table"
                ? "bg-[var(--accent)] text-white"
                : "hover:bg-[var(--accent)]/10"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6h16.5M3.75 12h16.5m-16.5 6h16.5" />
            </svg>
            表格
          </button>
          <button
            type="button"
            onClick={() => changeView("card")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
              view === "card"
                ? "bg-[var(--accent)] text-white"
                : "hover:bg-[var(--accent)]/10"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm9.75 0A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm-9.75 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75 0a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
            </svg>
            卡片
          </button>
        </div>
      </div>

      {/* 月份圖表 */}
      {showChart && (
        <div className="mb-4">
          <PreorderMonthlyChart preorders={preorders} />
        </div>
      )}

      {/* 未到貨進度總覽 */}
      {showTimeline && (
        <div className="mb-4">
          <PreorderTimeline preorders={preorders} />
        </div>
      )}

      {/* 表格模式 */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
          <table className="min-w-[780px] w-full text-left text-base">
            <thead className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
              <tr>
                <th className="px-4 py-3 font-medium min-w-[200px]">
                  <button
                    type="button"
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    名稱{sortIndicator("name")}
                  </button>
                </th>
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
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("store")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    店家 / 平台{sortIndicator("store")}
                  </button>
                </th>
                <th className="sticky right-[216px] z-10 bg-[var(--card-bg)] px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("arrived")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    到貨狀態{sortIndicator("arrived")}
                  </button>
                </th>
                <th className="sticky right-0 z-20 min-w-[216px] bg-[var(--card-bg)] px-4 py-3 font-medium whitespace-nowrap">操作</th>
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
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="mr-1.5 inline-block rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-0.5 text-xs">{p.store}</span>
                    <span className="inline-block rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] px-2 py-0.5 text-xs">{p.platform}</span>
                  </td>
                  <td
                    className={`sticky right-[216px] z-[1] px-4 py-3 whitespace-nowrap ${
                      i % 2 === 1 ? "bg-[var(--card-bg)]" : "bg-[var(--background)]"
                    }`}
                  >
                    <ArrivedToggle id={p.id} arrived={p.arrived} toggleAction={toggleArrivedAction} />
                  </td>
                  <td
                    className={`sticky right-0 z-[2] min-w-[216px] px-4 py-3 whitespace-nowrap ${
                      i % 2 === 1 ? "bg-[var(--card-bg)]" : "bg-[var(--background)]"
                    }`}
                  >
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
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug">{p.name}</h3>
                  <ArrivedToggle id={p.id} arrived={p.arrived} toggleAction={toggleArrivedAction} />
                </div>
                <div className="mb-3 text-lg font-bold text-[var(--accent)]">
                  NT${p.price.toLocaleString()}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {p.releaseDate}
                  </span>
                  <span className="inline-block rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">
                    {p.store}
                  </span>
                  <span className="inline-block rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">
                    {p.platform}
                  </span>
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
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("確定要刪除這筆預購模型資料嗎？")) return;
    setPending(true);
    try {
      await deleteAction(id);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/preorders/${id}/edit`}
        className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-bold text-white hover:opacity-80 transition-colors"
      >
        編輯
      </Link>
      <Link
        href={`/admin/figures/new?fromPreorder=${id}`}
        title="複製到模型列表"
        className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-bold text-white hover:opacity-80 transition-colors"
      >
        複製
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded bg-red-500 px-3 py-1.5 text-sm font-bold text-white hover:opacity-80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending && <Spinner className="h-3 w-3" />}
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
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("確定要刪除這筆預購模型資料嗎？")) return;
    setPending(true);
    try {
      await deleteAction(id);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex border-t border-[var(--card-border)]">
      <Link
        href={`/admin/preorders/${id}/edit`}
        className="flex-1 py-3 text-center text-base font-bold tracking-widest bg-[var(--accent)] text-white hover:opacity-80 transition-colors"
      >
        編輯
      </Link>
      <Link
        href={`/admin/figures/new?fromPreorder=${id}`}
        title="複製到模型列表"
        className="flex-1 py-3 text-center text-base font-bold tracking-widest bg-emerald-600 text-white hover:opacity-80 transition-colors"
      >
        複製
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-center text-base font-bold tracking-widest bg-red-500 text-white hover:opacity-80 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {pending && <Spinner className="h-4 w-4" />}
        刪除
      </button>
    </div>
  );
}
