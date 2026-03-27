"use client";

import { useState, useCallback, useRef } from "react";

declare global {
  interface Window {
    ECPay: {
      initialize: (
        env: string,
        mode: number,
        callback: (errMsg: string | null) => void
      ) => void;
      createPayment: (
        token: string,
        lang: string,
        callback: (errMsg: string | null) => void,
        version: string
      ) => void;
      getPayToken: (
        callback: (
          paymentInfo: { PayToken: string } | null,
          errMsg: string | null
        ) => void
      ) => void;
    };
    jQuery: unknown;
  }
}

interface Props {
  figureId: string;
  figureName: string;
  price: number;
}

type Stage =
  | "idle"
  | "input"
  | "loading"
  | "card"
  | "paying"
  | "redirecting"
  | "success"
  | "error";

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function EcpayPayment({ figureId, figureName, price }: Props) {
  const [stage, setStage] = useState<Stage>("idle");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const tradeNoRef = useRef("");
  const sdkInitRef = useRef(false);

  // 步驟 1：取 Token → 步驟 2：載入 JS SDK → 渲染信用卡表單
  const handleStartPayment = useCallback(async () => {
    if (!email || !email.includes("@")) {
      setErrorMsg("請輸入有效的 Email");
      return;
    }
    setStage("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/ecpay/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ figureId, buyerEmail: email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "取得 Token 失敗");

      tradeNoRef.current = data.merchantTradeNo;

      // 載入 JS SDK 依賴（順序：jQuery → node-forge → ECPay SDK）
      // ⚠️ JS SDK 一律從正式 domain 載入，用 initialize('Stage') 切換環境
      await loadScript("https://code.jquery.com/jquery-3.7.1.min.js");
      await loadScript(
        "https://cdn.jsdelivr.net/npm/node-forge@0.7.0/dist/forge.min.js"
      );
      await loadScript("https://ecpg.ecpay.com.tw/Scripts/sdk-1.0.0.js");

      setStage("card");

      // ⚠️ createPayment 必須在 initialize callback 內，否則會競態條件
      const envStr =
        process.env.NEXT_PUBLIC_ECPAY_ENV === "prod" ? "Prod" : "Stage";

      if (!sdkInitRef.current) {
        window.ECPay.initialize(envStr, 1, (errMsg) => {
          if (errMsg != null) {
            setErrorMsg(`SDK 初始化失敗: ${errMsg}`);
            setStage("error");
            return;
          }
          sdkInitRef.current = true;
          // ⚠️ <div id="ECPayPayment"> 是固定 ID，不可更改
          window.ECPay.createPayment(data.token, "zh-TW", (errMsg2) => {
            if (errMsg2 != null) {
              setErrorMsg(`建立付款表單失敗: ${errMsg2}`);
              setStage("error");
            }
          }, "V2");
        });
      } else {
        window.ECPay.createPayment(data.token, "zh-TW", (errMsg2) => {
          if (errMsg2 != null) {
            setErrorMsg(`建立付款表單失敗: ${errMsg2}`);
            setStage("error");
          }
        }, "V2");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "發生錯誤");
      setStage("error");
    }
  }, [email, figureId]);

  // 步驟 3 + 4：取 PayToken → CreatePayment
  const handleConfirmPayment = useCallback(async () => {
    setStage("paying");
    setErrorMsg("");

    // 30 秒 timeout 防止 getPayToken 永遠沒回應
    let responded = false;
    const timeout = setTimeout(() => {
      if (!responded) {
        setErrorMsg("取得 PayToken 逾時，請重新嘗試");
        setStage("error");
      }
    }, 30000);

    try {
      window.ECPay.getPayToken(async (paymentInfo, errMsg) => {
        responded = true;
        clearTimeout(timeout);

        // ⚠️ errMsg 檢查必須用 != null（非 if (errMsg)）
        if (errMsg != null) {
          setErrorMsg(`取得 PayToken 失敗: ${errMsg}`);
          setStage("card");
          return;
        }
        if (!paymentInfo?.PayToken) {
          setErrorMsg("PayToken 無效");
          setStage("card");
          return;
        }

        try {
          const res = await fetch("/api/ecpay/create-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payToken: paymentInfo.PayToken,
              merchantTradeNo: tradeNoRef.current,
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "建立交易失敗");

          if (data.threeDUrl) {
            setStage("redirecting");
            // ⚠️ 3D 驗證必須用 window.location.href，不可用 router.push
            window.location.href = data.threeDUrl;
          } else if (data.success) {
            setStage("success");
          } else {
            throw new Error(data.error || "交易失敗");
          }
        } catch (err: unknown) {
          setErrorMsg(err instanceof Error ? err.message : "交易發生錯誤");
          setStage("error");
        }
      });
    } catch (sdkErr: unknown) {
      responded = true;
      clearTimeout(timeout);
      setErrorMsg(sdkErr instanceof Error ? sdkErr.message : "SDK 呼叫失敗");
      setStage("error");
    }
  }, []);

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
            {stage === "loading" ? "載入中..." : "開始付款"}
          </button>
        </div>
      )}

      {/* ECPay 信用卡表單容器（固定 ID，不可更改） */}
      {(stage === "card" || stage === "paying") && (
        <div className="space-y-3">
          <div id="ECPayPayment" className="min-h-[200px]" />
          <button
            onClick={handleConfirmPayment}
            disabled={stage === "paying"}
            className="w-full rounded-lg bg-[var(--accent)] px-6 py-3 text-lg font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {stage === "paying"
              ? "處理中..."
              : `確認付款 NT$${price.toLocaleString()}`}
          </button>
        </div>
      )}

      {/* 3D 驗證跳轉中 */}
      {stage === "redirecting" && (
        <p className="py-4 text-center text-[var(--foreground)]/70">
          正在前往信用卡驗證頁面...
        </p>
      )}

      {/* 成功 */}
      {stage === "success" && (
        <div className="rounded-md bg-emerald-600/10 p-4 text-emerald-600">
          ✓ 付款成功！賣家確認後將安排出貨。
        </div>
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
