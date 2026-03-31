"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Figure } from "@/data/figures";

interface Props {
  figures: Figure[];
  deleteAction: (id: string) => Promise<void>;
}

export default function AdminFigureList({ figures, deleteAction }: Props) {
  const [view, setView] = useState<"table" | "card">("table");
  const [mounted, setMounted] = useState(false);

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
                <th className="px-4 py-3 font-medium">名稱</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">品項狀態</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">盒況</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">價格</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">交易方式</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">銷售方式</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">售出狀態</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {figures.map((fig) => (
                <tr
                  key={fig.id}
                  className="border-b border-[var(--card-border)] last:border-0"
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
                    <SaleMethodBadge saleMethod={fig.saleMethod} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <SoldStatusBadge soldStatus={fig.soldStatus} />
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
          {figures.map((fig) => (
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
                    <SaleMethodBadge saleMethod={fig.saleMethod} />
                  </div>

                  <div>
                    <SoldStatusBadge soldStatus={fig.soldStatus} />
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

function SaleMethodBadge({ saleMethod }: { saleMethod: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
        saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
      }`}
    >
      {saleMethod}
    </span>
  );
}

function SoldStatusBadge({ soldStatus }: { soldStatus: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
        soldStatus === "已售出"
          ? "bg-red-600"
          : soldStatus === "準備中"
            ? "bg-yellow-500"
            : "bg-emerald-600"
      }`}
    >
      {soldStatus}
    </span>
  );
}

function Actions({
  figId,
  deleteAction,
}: {
  figId: string;
  deleteAction: (id: string) => Promise<void>;
}) {
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
        onClick={() => {
          if (confirm("確定要刪除這筆模型資料嗎？")) deleteAction(figId);
        }}
        className="rounded bg-red-500 px-3 py-1.5 text-sm font-bold text-white hover:opacity-80 transition-colors"
      >
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
        onClick={() => {
          if (confirm("確定要刪除這筆模型資料嗎？")) deleteAction(figId);
        }}
        className="flex-1 py-3 text-center text-base font-bold tracking-widest bg-red-500 text-white hover:opacity-80 transition-colors"
      >
        刪除
      </button>
    </div>
  );
}
