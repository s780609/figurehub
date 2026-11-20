"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import type { Figure } from "@/data/figures";
import Spinner from "./Spinner";

type SortKey =
  | "name"
  | "condition"
  | "boxCondition"
  | "price"
  | "dealPrice"
  | "shippingMethod"
  | "saleMethod"
  | "soldStatus";
type SortDir = "asc" | "desc";
type FilterTab = "all" | "unsold" | "preparing" | "sold";

const CONDITION_ORDER: Record<string, number> = { "全新未拆": 0, "拆擺": 1 };
const BOX_CONDITION_ORDER: Record<string, number> = { "佳": 0, "普通": 1, "差": 2, "無盒": 3 };
const SOLD_STATUS_ORDER: Record<string, number> = { "未售出": 0, "準備中": 1, "已售出": 2 };

interface Props {
  figures: Figure[];
  deleteAction: (id: string) => Promise<void>;
  cycleSaleMethodAction: (id: string) => Promise<void>;
  cycleSoldStatusAction: (id: string) => Promise<void>;
}

export default function AdminFigureList({
  figures,
  deleteAction,
  cycleSaleMethodAction,
  cycleSoldStatusAction,
}: Props) {
  const [view, setView] = useState<"table" | "card">("table");
  const [mounted, setMounted] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [filterTab, setFilterTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const filteredFigures = useMemo(() => {
    let list = figures;
    if (filterTab === "unsold") list = list.filter((f) => f.soldStatus === "未售出");
    else if (filterTab === "preparing") list = list.filter((f) => f.soldStatus === "準備中");
    else if (filterTab === "sold") list = list.filter((f) => f.soldStatus === "已售出");
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(q));
    }
    return list;
  }, [figures, filterTab, search]);

  const sortedFigures = useMemo(() => {
    if (!sortKey) return filteredFigures;
    const arr = [...filteredFigures];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") cmp = a.name.localeCompare(b.name, "zh-Hant");
      else if (sortKey === "condition") cmp = (CONDITION_ORDER[a.condition] ?? 99) - (CONDITION_ORDER[b.condition] ?? 99);
      else if (sortKey === "boxCondition") cmp = (BOX_CONDITION_ORDER[a.boxCondition] ?? 99) - (BOX_CONDITION_ORDER[b.boxCondition] ?? 99);
      else if (sortKey === "price") cmp = a.price - b.price;
      else if (sortKey === "dealPrice") cmp = (a.dealPrice ?? -1) - (b.dealPrice ?? -1);
      else if (sortKey === "shippingMethod") cmp = a.shippingMethod.localeCompare(b.shippingMethod, "zh-Hant");
      else if (sortKey === "saleMethod") cmp = a.saleMethod.localeCompare(b.saleMethod, "zh-Hant");
      else if (sortKey === "soldStatus") cmp = (SOLD_STATUS_ORDER[a.soldStatus] ?? 99) - (SOLD_STATUS_ORDER[b.soldStatus] ?? 99);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredFigures, sortKey, sortDir]);

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
    const saved = localStorage.getItem("admin-view");
    if (saved === "card" || saved === "table") setView(saved);
    else setView(window.innerWidth < 640 ? "card" : "table");
    setMounted(true);
  }, []);

  const changeView = (v: "table" | "card") => {
    setView(v);
    localStorage.setItem("admin-view", v);
  };

  const unsoldCount = figures.filter((f) => f.soldStatus === "未售出").length;
  const preparingCount = figures.filter((f) => f.soldStatus === "準備中").length;
  const soldCount = figures.filter((f) => f.soldStatus === "已售出").length;

  if (figures.length === 0) {
    return <p className="text-center text-[var(--foreground)]/40 py-12">尚無模型資料</p>;
  }

  return (
    <>
      {/* 工具列 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-[220px]">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground)]/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜尋模型名稱..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] py-1.5 pl-9 pr-3 text-sm outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden">
            {([
              ["all", "全部", figures.length],
              ["unsold", "未售出", unsoldCount],
              ["preparing", "準備中", preparingCount],
              ["sold", "已售出", soldCount],
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

      {sortedFigures.length === 0 && (
        <p className="text-center text-[var(--foreground)]/40 py-12">
          {search ? "找不到符合的模型" : "此分類沒有模型"}
        </p>
      )}

      {/* 表格模式 */}
      {view === "table" && sortedFigures.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
              <tr>
                <th className="px-3 py-2.5 font-medium">
                  <button type="button" onClick={() => handleSort("name")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    名稱{sortIndicator("name")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("condition")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    品項{sortIndicator("condition")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("boxCondition")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    盒況{sortIndicator("boxCondition")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("price")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    價格{sortIndicator("price")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("dealPrice")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    成交價{sortIndicator("dealPrice")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("shippingMethod")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    交易{sortIndicator("shippingMethod")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("saleMethod")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    銷售{sortIndicator("saleMethod")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap">
                  <button type="button" onClick={() => handleSort("soldStatus")} className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer">
                    狀態{sortIndicator("soldStatus")}
                  </button>
                </th>
                <th className="px-3 py-2.5 font-medium whitespace-nowrap text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedFigures.map((fig, i) => (
                <tr key={fig.id} className={`border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--card-bg)]/50 ${i % 2 === 1 ? "bg-[var(--card-bg)]/30" : ""}`}>
                  <td className="px-3 py-2.5 font-medium max-w-[200px] truncate">{fig.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><ConditionBadge condition={fig.condition} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-[var(--foreground)]/60 text-xs">{fig.boxCondition}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-medium">NT${fig.price.toLocaleString()}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {fig.dealPrice != null ? <span className="font-medium">NT${fig.dealPrice.toLocaleString()}</span> : <span className="text-[var(--foreground)]/30">—</span>}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs">{fig.shippingMethod}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <SaleMethodBadge figId={fig.id} saleMethod={fig.saleMethod} cycleAction={cycleSaleMethodAction} />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <SoldStatusBadge figId={fig.id} soldStatus={fig.soldStatus} cycleAction={cycleSoldStatusAction} />
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex gap-1 justify-end">
                      <Link href={`/admin/figures/${fig.id}/edit`} className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/50 hover:text-[var(--accent)] transition-colors" title="編輯">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                      </Link>
                      <DeleteButton id={fig.id} deleteAction={deleteAction} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 卡片模式 */}
      {view === "card" && sortedFigures.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedFigures.map((fig) => (
            <div key={fig.id} className="flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden">
              <div className="flex flex-1">
                <div className="flex-1 p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-medium leading-snug text-sm">{fig.name}</h3>
                    <SoldStatusBadge figId={fig.id} soldStatus={fig.soldStatus} cycleAction={cycleSoldStatusAction} />
                  </div>
                  <div className="mb-2 text-lg font-bold text-[var(--accent)]">
                    NT${fig.price.toLocaleString()}
                    {fig.dealPrice != null && fig.dealPrice !== fig.price && (
                      <span className="ml-2 text-sm font-normal text-[var(--foreground)]/40">成交 NT${fig.dealPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <ConditionBadge condition={fig.condition} />
                    <span className="inline-block rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">{fig.boxCondition}</span>
                    <SaleMethodBadge figId={fig.id} saleMethod={fig.saleMethod} cycleAction={cycleSaleMethodAction} />
                    <span className="inline-block rounded-full border border-[var(--card-border)] px-2 py-0.5 text-xs text-[var(--foreground)]/60">{fig.shippingMethod}</span>
                  </div>
                </div>
                {fig.media.find((m) => m.type === "image") && (
                  <div className="w-24 shrink-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={fig.media.find((m) => m.type === "image")!.url}
                      alt={fig.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center justify-end gap-1 border-t border-[var(--card-border)] px-3 py-2">
                <Link href={`/admin/figures/${fig.id}/edit`} className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-[var(--foreground)]/5 text-[var(--foreground)]/50 hover:text-[var(--accent)] transition-colors" title="編輯">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" /></svg>
                </Link>
                <DeleteButton id={fig.id} deleteAction={deleteAction} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
      condition === "全新未拆" ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
    }`}>
      {condition}
    </span>
  );
}

function SaleMethodBadge({ figId, saleMethod, cycleAction }: { figId: string; saleMethod: string; cycleAction: (id: string) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => cycleAction(figId))}
      disabled={pending}
      title="點擊切換銷售方式"
      className={`inline-block cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50 ${
        saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
      }`}
    >
      {saleMethod}
    </button>
  );
}

function SoldStatusBadge({ figId, soldStatus, cycleAction }: { figId: string; soldStatus: string; cycleAction: (id: string) => Promise<void> }) {
  const [pending, startTransition] = useTransition();
  const config = soldStatus === "已售出"
    ? { bg: "bg-red-500/10 text-red-600 dark:text-red-400", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
    : soldStatus === "準備中"
      ? { bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" }
      : { bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" };

  return (
    <button
      type="button"
      onClick={() => startTransition(() => cycleAction(figId))}
      disabled={pending}
      title="點擊切換售出狀態"
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50 ${config.bg}`}
    >
      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={config.icon} />
      </svg>
      {soldStatus}
    </button>
  );
}

function DeleteButton({ id, deleteAction }: { id: string; deleteAction: (id: string) => Promise<void> }) {
  const [pending, setPending] = useState(false);
  const handleDelete = async () => {
    if (!confirm("確定要刪除這筆模型資料嗎？")) return;
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
