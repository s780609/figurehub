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
  | "shippingMethod"
  | "saleMethod"
  | "soldStatus";
type SortDir = "asc" | "desc";

const CONDITION_ORDER: Record<string, number> = {
  "全新未拆": 0,
  "拆擺": 1,
};

const BOX_CONDITION_ORDER: Record<string, number> = {
  "佳": 0,
  "普通": 1,
  "差": 2,
  "無盒": 3,
};

const SOLD_STATUS_ORDER: Record<string, number> = {
  "未售出": 0,
  "準備中": 1,
  "已售出": 2,
};

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

  const sortedFigures = useMemo(() => {
    if (!sortKey) return figures;
    const arr = [...figures];
    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = a.name.localeCompare(b.name, "zh-Hant");
      } else if (sortKey === "condition") {
        cmp = (CONDITION_ORDER[a.condition] ?? 99) - (CONDITION_ORDER[b.condition] ?? 99);
      } else if (sortKey === "boxCondition") {
        cmp = (BOX_CONDITION_ORDER[a.boxCondition] ?? 99) - (BOX_CONDITION_ORDER[b.boxCondition] ?? 99);
      } else if (sortKey === "price") {
        cmp = a.price - b.price;
      } else if (sortKey === "shippingMethod") {
        cmp = a.shippingMethod.localeCompare(b.shippingMethod, "zh-Hant");
      } else if (sortKey === "saleMethod") {
        cmp = a.saleMethod.localeCompare(b.saleMethod, "zh-Hant");
      } else if (sortKey === "soldStatus") {
        const av = SOLD_STATUS_ORDER[a.soldStatus] ?? 99;
        const bv = SOLD_STATUS_ORDER[b.soldStatus] ?? 99;
        cmp = av - bv;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [figures, sortKey, sortDir]);

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
    const saved = localStorage.getItem("admin-view");
    if (saved === "card" || saved === "table") {
      setView(saved);
    } else {
      setView(window.innerWidth < 640 ? "card" : "table");
    }
    setMounted(true);
  }, []);

  const changeView = (v: "table" | "card") => {
    setView(v);
    localStorage.setItem("admin-view", v);
  };

  if (figures.length === 0) {
    return (
      <p className="text-center text-[var(--foreground)]/40 py-12">
        尚無模型資料
      </p>
    );
  }

  return (
    <>
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
          <table className="min-w-[800px] w-full text-left text-base">
            <thead className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
              <tr>
                <th className="px-4 py-3 font-medium">
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
                    onClick={() => handleSort("condition")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    品項狀態{sortIndicator("condition")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("boxCondition")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    盒況{sortIndicator("boxCondition")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("price")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    價格{sortIndicator("price")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("shippingMethod")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    交易方式{sortIndicator("shippingMethod")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("saleMethod")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    銷售方式{sortIndicator("saleMethod")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleSort("soldStatus")}
                    className="flex items-center hover:text-[var(--accent)] transition-colors cursor-pointer"
                  >
                    售出狀態{sortIndicator("soldStatus")}
                  </button>
                </th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedFigures.map((fig, i) => (
                <tr
                  key={fig.id}
                  className={`border-b border-[var(--card-border)] last:border-0 ${i % 2 === 1 ? "bg-[var(--card-bg)]" : ""}`}
                >
                  <td className="px-4 py-3 font-medium">{fig.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <ConditionBadge condition={fig.condition} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fig.boxCondition}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    NT${fig.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fig.shippingMethod}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SaleMethodBadge
                      figId={fig.id}
                      saleMethod={fig.saleMethod}
                      cycleAction={cycleSaleMethodAction}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SoldStatusBadge
                      figId={fig.id}
                      soldStatus={fig.soldStatus}
                      cycleAction={cycleSoldStatusAction}
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Actions figId={fig.id} deleteAction={deleteAction} />
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
          {sortedFigures.map((fig) => (
            <div
              key={fig.id}
              className="flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden"
            >
              <div className="flex flex-1">
                <div className="flex-1 p-4">
                  <h3 className="mb-2 font-medium leading-snug">{fig.name}</h3>

                  <div className="mb-3 text-lg font-bold text-[var(--accent)]">
                    NT${fig.price.toLocaleString()}
                  </div>

                  <div className="mb-2 flex flex-wrap gap-1.5">
                    <ConditionBadge condition={fig.condition} />
                    <span className="inline-block rounded-full bg-gray-500 px-2 py-0.5 text-xs font-medium text-white">
                      盒況{fig.boxCondition}
                    </span>
                    <span className="inline-block rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
                      {fig.shippingMethod}
                    </span>
                    <SaleMethodBadge
                      figId={fig.id}
                      saleMethod={fig.saleMethod}
                      cycleAction={cycleSaleMethodAction}
                    />
                  </div>

                  <div>
                    <SoldStatusBadge
                      figId={fig.id}
                      soldStatus={fig.soldStatus}
                      cycleAction={cycleSoldStatusAction}
                    />
                  </div>
                </div>

                <div className="w-28 shrink-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800">
                  {fig.media.find((m) => m.type === "image") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fig.media.find((m) => m.type === "image")!.url}
                      alt={fig.name}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-3xl text-[var(--foreground)]/20">?</span>
                  )}
                </div>
              </div>

              <CardActions figId={fig.id} deleteAction={deleteAction} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function ConditionBadge({ condition }: { condition: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
        condition === "全新未拆" ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
      }`}
    >
      {condition}
    </span>
  );
}

function SaleMethodBadge({
  figId,
  saleMethod,
  cycleAction,
}: {
  figId: string;
  saleMethod: string;
  cycleAction: (id: string) => Promise<void>;
}) {
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

function SoldStatusBadge({
  figId,
  soldStatus,
  cycleAction,
}: {
  figId: string;
  soldStatus: string;
  cycleAction: (id: string) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      onClick={() => startTransition(() => cycleAction(figId))}
      disabled={pending}
      title="點擊切換售出狀態"
      className={`inline-block cursor-pointer rounded-full px-2 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-50 ${
        soldStatus === "已售出"
          ? "bg-red-600"
          : soldStatus === "準備中"
            ? "bg-yellow-500"
            : "bg-emerald-600"
      }`}
    >
      {soldStatus}
    </button>
  );
}

function Actions({
  figId,
  deleteAction,
}: {
  figId: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("確定要刪除這筆模型資料嗎？")) return;
    setPending(true);
    try {
      await deleteAction(figId);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Link
        href={`/admin/figures/${figId}/edit`}
        className="rounded bg-[var(--accent)] px-3 py-1.5 text-sm font-bold text-white hover:opacity-80 transition-colors"
      >
        編輯
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
  figId,
  deleteAction,
}: {
  figId: string;
  deleteAction: (id: string) => Promise<void>;
}) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("確定要刪除這筆模型資料嗎？")) return;
    setPending(true);
    try {
      await deleteAction(figId);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex border-t border-[var(--card-border)]">
      <Link
        href={`/admin/figures/${figId}/edit`}
        className="flex-1 py-3 text-center text-base font-bold tracking-widest bg-[var(--accent)] text-white hover:opacity-80 transition-colors"
      >
        編輯
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
