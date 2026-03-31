"use client";

import { useState, useEffect } from "react";

export default function PaymentBanner() {
  const [msg, setMsg] = useState<string | null>(null);
  const [type, setType] = useState<"success" | "failed" | "pending">("success");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    if (payment === "success") {
      setMsg("付款成功！賣家確認後將安排出貨。");
      setType("success");
    } else if (payment === "pending") {
      setMsg("付款處理中，請稍後重新整理頁面確認。");
      setType("pending");
    } else if (payment === "failed") {
      setMsg("付款未完成，請重新嘗試。");
      setType("failed");
    }
  }, []);

  if (!msg) return null;
  return (
    <div
      className={`mb-6 rounded-lg p-4 text-center font-medium ${
        type === "success"
          ? "bg-emerald-600/10 text-emerald-600"
          : type === "pending"
            ? "bg-yellow-600/10 text-yellow-600"
            : "bg-red-600/10 text-red-500"
      }`}
    >
      {msg}
    </div>
  );
}
