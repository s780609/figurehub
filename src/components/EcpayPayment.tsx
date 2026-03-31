"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface Props {
  figureId: string;
  figureName: string;
  price: number;
}

type Stage = "idle" | "input" | "loading" | "redirecting" | "error";

export default function EcpayPayment({ figureId, figureName, price }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = useState<{
    params: Record<string, string | number>;
    actionUrl: string;
  } | null>(null);

  // 取得 AIO 表單參數後自動 submit
  useEffect(() => {
    if (formData && formRef.current) {
      setStage("redirecting");
      formRef.current.submit();
    }
  }, [formData]);

  const handleStartPayment = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("請輸入有效的 Email");
      return;
    }
    setStage("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ecpay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figureId, buyerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "建立訂單失敗");

      // 設定表單資料，觸發 useEffect 自動 submit 到綠界付款頁
      setFormData({ params: data.params, actionUrl: data.actionUrl });
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "發生錯誤");
      setStage("error");
    }
  }, [email, figureId]);

  if (stage === "idle") {
    return (
      <div className="mb-8 rounded-lg border-2 border-[var(--accent)] bg-[var(--card-bg)] p-5">
        <h3 className="mb-2 text-lg font-bold text-[var(--accent)]">
          立即購買
        </h3>
        <p className="mb-3 text-[var(--foreground)]/70">
          NT${price.toLocaleString()} — 信用卡付款
        </p>
        <button
          onClick={() => setStage("input")}
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 font-medium text-white hover:opacity-90 transition-opacity"
        >
          我要購買
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border-2 border-[var(--accent)] bg-[var(--card-bg)] p-5">
      <h3 className="mb-2 text-lg font-bold text-[var(--accent)]">
        購買 — NT${price.toLocaleString()}
      </h3>

      {/* Email 輸入 */}
      {(stage === "input" || stage === "loading") && (
        <div className="space-y-3">
          <label className="block text-sm font-medium">
            Email（收取付款通知）
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="mt-1 block w-full rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-base"
              disabled={stage === "loading"}
            />
          </label>
          <button
            onClick={handleStartPayment}
            disabled={stage === "loading"}
            className="rounded-lg bg-[var(--accent)] px-6 py-2.5 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {stage === "loading" ? "處理中..." : "前往付款"}
          </button>
        </div>
      )}

      {/* 跳轉到綠界付款頁中 */}
      {stage === "redirecting" && (
        <p className="py-4 text-center text-[var(--foreground)]/70">
          正在前往綠界付款頁面...
        </p>
      )}

      {/* 隱藏表單：自動 submit 到綠界 AioCheckOut */}
      {formData && (
        <form
          ref={formRef}
          method="POST"
          action={formData.actionUrl}
          style={{ display: "none" }}
        >
          {Object.entries(formData.params).map(([key, value]) => (
            <input key={key} type="hidden" name={key} value={String(value)} />
          ))}
        </form>
      )}

      {/* 錯誤 */}
      {errorMsg && (
        <div className="mt-3 rounded-md bg-red-600/10 p-3 text-sm text-red-500">
          {errorMsg}
          {stage === "error" && (
            <button
              onClick={() => {
                setStage("input");
                setErrorMsg("");
              }}
              className="ml-3 underline"
            >
              重試
            </button>
          )}
        </div>
      )}
    </div>
  );
}
