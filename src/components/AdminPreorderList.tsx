"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { PreorderFigure } from "@/data/preorders";
import Spinner from "./Spinner";

type SortKey = "name" | "releaseDate" | "price" | "store" | "platform" | "arrived";
type SortDir = "asc" | "desc";
type FilterTab = "all" | "unshipped" | "shipped";

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
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const totalPrice = preorders.reduce((sum, p) => sum + p.price, 0);
  const shippedCount = preorders.filter(p => p.arrived).length;
  const unshippedCount = preorders.filter(p => !p.arrived).length;
  const shippedPrice = preorders.filter(p => p.arrived).reduce((sum, p) => sum + p.price, 0);
  const unshippedPrice = preorders.filter(p => !p.arrived).reduce((sum, p) => sum + p.price, 0);

  const filteredPreorders = useMemo(() => {
    let list = preorders;
    if (filterTab === "unshipped") list = list.filter((p) => !p.arrived);
    else if (filterTab === "shipped") list = list.filter((p) => p.arrived);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [preorders, filterTab, search]);

  const sortedPreorders = useMemo(() => {
    if (!sortKey) return filteredPreorders;
    const arr = [...filteredPreorders];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "zh-Hant");
      else if (sortKey === "releaseDate") cmp = (a.releaseDate || "").localeCompare(b.releaseDate || "");
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "store") cmp = a.store.localeCompare(b.store, "zh-Hant");
      else if (sortKey === "platform") cmp = a.platform.localeCompare(b.platform, "zh-Hant");
      else if (sortKey === "arrived") cmp = Number(a.arrived) - Number(b.arrived);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredPreorders, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else { setSortKey(null); setSortDir("asc"); }
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
    if (saved === "card" || saved === "table") setView(saved);
    else setView(window.innerWidth < 640 ? "card" : "table");
    setMounted(true);
  }, []);

  const changeView = (v: "table" | "card") => {
    setView(v);
    localStorage.setItem("admin-preorder-view", v);
  };

  if (preorders.length === 0) {
    return <p className="text-center text-[var(--foreground)]/40 py-12">尚無預購模型資料</p>;
  }

  return (
    <>
      {/* 統計卡片 */}
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-[var(--card-bg)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" /></svg>
            預購總金額
          </p>
          <p className="text-xl font-bold text-[var(--accent)]">NT${totalPrice.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">{preorders.length} 件預購</p>
        </div>
        <div className="rounded-lg bg-[var(--card-bg)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            未到貨
          </p>
          <p className="text-xl font-bold text-amber-500">NT${unshippedPrice.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">{unshippedCount} 件等待中</p>
        </div>
        <div className="rounded-lg bg-[var(--card-bg)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            已到貨
          </p>
          <p className="text-xl font-bold text-emerald-500">NT${shippedPrice.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">{shippedCount} 件已完成</p>
        </div>
      </div>

      {/* 工具列 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-[220px]">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜尋預購名稱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] py-1.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden">
            {([
              ["all", "全部", preorders.length],
              ["unshipped", "未到貨", unshippedCount],
              ["shipped", "已到貨", shippedCount],
            ] as const).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterTab(key as FilterTab)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  filterTab === key
                    ? "bg-[var(--accent)] text-white"
                    : "hover:bg-[var(--foreground)]/5"
                }`}
              >
                {label}
                <span className="ml-1 opacity-70">{count}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showChart
                ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                : "border-[var(--card-border)] hover:bg-[var(--foreground)]/5"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            圖表
          </button>
          <button
            type="button"
            onClick={() => setShowTimeline(!showTimeline)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              showTimeline
                ? "border-amber-500 bg-amber-500 text-white"
                : "border-[var(--card-border)] hover:bg-[var(--foreground)]/5"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            進度
          </button>
          <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden">
            <button
              type="button"
              onClick={() => changeView("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "table" ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--foreground)]/5"
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
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                view === "card" ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--foreground)]/5"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm9.75 0A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm-9.75 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75 0a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
              </svg>
              卡片
            </button>
          </div>
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

      {sortedPreorders.length === 0 && (
        <p className="text-center text-[var(--foreground)]/40 py-12">
          {search ? "找不到符合的預購" : "此分類沒有預購"}
        </p>
      )}

      {/* 表格模式 */}
      {view === "table" && sortedPreorders.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
          <table className="min-w-[700px] w-full text-left text-sm">
            <thead className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
              <tr>
                <th className="px-3 py-2.5 font-medium">
                  <button type="button" onClick={() => handleSort("name")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    名稱{sortIndicator("name")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("releaseDate")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    發售日期{sortIndicator("releaseDate")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("price")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    金額{sortIndicator("price")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("store")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    店家{sortIndicator("store")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("platform")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    平台{sortIndicator("platform")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("arrived")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    狀態{sortIndicator("arrived")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedPreorders.map((p, i) => (
                <tr key={p.id} className={`border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-bg)]/50 ${i % 2 === 1 ? "bg-[var(--card-bg)]/30" : ""}`}>
                  <td className="px-3 py-2.5 font-medium max-w-[200px] truncate">{p.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[var(--foreground)]/60 text-xs">{p.releaseDate}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-medium">NT${p.price.toLocaleString()}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs">{p.store}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs">{p.platform}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <ArrivedToggle id={p.id} arrived={p.arrived} toggleAction={toggleArrivedAction} />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/admin/preorders/${p.id}/edit`} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/50 hover:text-[var(--accent)] transition-colors" title="編輯">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                      </Link>
                      <Link href={`/admin/figures/new?fromPreorder=${p.id}`} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/50 hover:text-emerald-500 transition-colors" title="複製到模型列表">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                      </Link>
                      <DeleteButton id={p.id} deleteAction={deleteAction} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 卡片模式 */}
      {view === "card" && sortedPreorders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedPreorders.map((p) => (
            <div key={p.id} className="flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
              <div className="flex-1 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="font-medium leading-snug text-sm">{p.name}</h3>
                  <ArrivedToggle id={p.id} arrived={p.arrived} toggleAction={toggleArrivedAction} />
                </div>
                <div className="mb-2 text-lg font-bold text-[var(--accent)]">
                  NT${p.price.toLocaleString()}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {p.releaseDate}
                  </span>
                  <span className="inline-block rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">{p.store}</span>
                  <span className="inline-block rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">{p.platform}</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-1 border-t border-[var(--card-border)] px-3 py-2">
                <Link href={`/admin/preorders/${p.id}/edit`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/50 hover:text-[var(--accent)] transition-colors" title="編輯">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                </Link>
                <Link href={`/admin/figures/new?fromPreorder=${p.id}`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/50 hover:text-emerald-500 transition-colors" title="複製到模型列表">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                </Link>
                <DeleteButton id={p.id} deleteAction={deleteAction} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ArrivedToggle({ id, arrived, toggleAction }: { id: string; arrived: boolean; toggleAction: (id: string) => Promise<void> }) {
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
      title="點擊切換到貨狀態"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 ${
        arrived
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      } ${loading ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
    >
      {loading ? (
        <Spinner className="h-3 w-3" />
      ) : (
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {arrived ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          )}
        </svg>
      )}
      {arrived ? "已到貨" : "未到貨"}
    </button>
  );
}

function DeleteButton({ id, deleteAction }: { id: string; deleteAction: (id: string) => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const handleDelete = async () => {
    if (!confirm("確定要刪除這筆預購模型資料嗎？")) return;
    setPending(true);
    try { await deleteAction(id); } finally { setPending(false); }
  };
  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-red-500/10 text-[var(--foreground)]/50 hover:text-red-500 transition-colors disabled:opacity-50"
      title="刪除"
    >
      {pending ? <Spinner className="h-3.5 w-3.5" /> : (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
      )}
    </button>
  );
}
