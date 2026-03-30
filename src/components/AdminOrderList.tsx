"use client";

import { useState, useEffect } from "react";
import type { Order } from "@/data/orders";

interface Props {
  orders: Order[];
  updateStatusAction: (orderId: string, status: "paid" | "failed") => Promise<void>;
}

export default function AdminOrderList({ orders, updateStatusAction }: Props) {
  const [view, setView] = useState<"table" | "card">("table");

  useEffect(() => {
    const saved = localStorage.getItem("admin-order-view");
    if (saved === "card" || saved === "table") {
      setView(saved);
    } else {
      setView(window.innerWidth < 640 ? "card" : "table");
    }
  }, []);

  const changeView = (v: "table" | "card") => {
    setView(v);
    localStorage.setItem("admin-order-view", v);
  };

  if (orders.length === 0) {
    return (
      <p className="text-center text-[var(--foreground)]/40 py-12">
        尚無訂單資料
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
                <th className="px-4 py-3 font-medium">商品名稱</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">金額</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">買家 Email</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">訂單編號</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">狀態</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">建立時間</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">付款時間</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--card-border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{order.figureName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    NT${order.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {order.buyerEmail}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                    {order.merchantTradeNo}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {order.paidAt ? formatDate(order.paidAt) : "—"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Actions order={order} updateStatusAction={updateStatusAction} />
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
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden"
            >
              <div className="flex-1 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-medium leading-snug">{order.figureName}</h3>
                  <StatusBadge status={order.status} />
                </div>

                <div className="mb-3 text-lg font-bold text-[var(--accent)]">
                  NT${order.amount.toLocaleString()}
                </div>

                <div className="space-y-1 text-sm text-[var(--foreground)]/70">
                  <p>買家：{order.buyerEmail}</p>
                  <p className="font-mono">訂單：{order.merchantTradeNo}</p>
                  {order.ecpayTradeNo && (
                    <p className="font-mono">ECPay：{order.ecpayTradeNo}</p>
                  )}
                  <p>建立：{formatDate(order.createdAt)}</p>
                  {order.paidAt && <p>付款：{formatDate(order.paidAt)}</p>}
                </div>
              </div>

              {order.status === "pending" && (
                <div className="flex border-t border-[var(--card-border)]">
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("確定要手動標記為已付款？")) updateStatusAction(order.id, "paid");
                    }}
                    className="flex-1 py-3 text-center text-base font-medium tracking-widest bg-emerald-600 text-white hover:opacity-80 transition-colors"
                  >
                    標記已付款
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("確定要標記為失敗？")) updateStatusAction(order.id, "failed");
                    }}
                    className="flex-1 py-3 text-center text-base font-medium tracking-widest bg-red-500 text-white hover:opacity-80 transition-colors"
                  >
                    標記失敗
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: "bg-emerald-600",
    pending: "bg-yellow-500",
    failed: "bg-red-600",
  };
  const labels: Record<string, string> = {
    paid: "已付款",
    pending: "待處理",
    failed: "失敗",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
        styles[status] ?? "bg-gray-500"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function formatDate(date: Date) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function Actions({
  order,
  updateStatusAction,
}: {
  order: Order;
  updateStatusAction: (orderId: string, status: "paid" | "failed") => Promise<void>;
}) {
  if (order.status !== "pending") return null;

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => {
          if (confirm("確定要手動標記為已付款？")) updateStatusAction(order.id, "paid");
        }}
        className="rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:opacity-80 transition-colors"
      >
        標記已付款
      </button>
      <button
        type="button"
        onClick={() => {
          if (confirm("確定要標記為失敗？")) updateStatusAction(order.id, "failed");
        }}
        className="rounded bg-red-500 px-2 py-1 text-xs font-medium text-white hover:opacity-80 transition-colors"
      >
        標記失敗
      </button>
    </div>
  );
}
