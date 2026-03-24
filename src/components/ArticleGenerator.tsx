"use client";

import { useState } from "react";
import type { Figure } from "@/data/figures";

type ArticleType = "sell" | "bid";

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

function getDefaultEndTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const d = String(tomorrow.getDate()).padStart(2, "0");
  const w = weekDays[tomorrow.getDay()];
  return `${y}/${m}/${d} (週${w}) 晚上 22:00:00`;
}

interface Props {
  figures: Figure[];
}

function getDefaultSelected(figures: Figure[], type: ArticleType): Set<string> {
  const saleMethod = type === "sell" ? "出售" : "競標";
  return new Set(figures.filter((f) => f.saleMethod === saleMethod).map((f) => f.id));
}

export default function ArticleGenerator({ figures }: Props) {
  const [articleType, setArticleType] = useState<ArticleType>("sell");
  const [selected, setSelected] = useState<Set<string>>(
    () => getDefaultSelected(figures, "sell")
  );
  const [description, setDescription] = useState("拆擺 無菸環境 都放在櫃中");
  const [note, setNote] = useState("若有問題可私訊。");
  const [bidDescription, setBidDescription] = useState(
    "盒況普通，請當初拿到就一直放在房間，無日曬\n我自己不會很認真檢查PVC，所以只要不是明顯瑕疵，都不會發現\n在意者勿標"
  );
  const [bidEndTime, setBidEndTime] = useState(getDefaultEndTime);
  const [bidNote, setBidNote] = useState(
    `售出無退貨，如有拆損請自行負責，請詳閱以上內容，可接受再下標！歡迎多多詢問！
會把箱子盡量塞滿緩衝物後寄出
得標三日內未回覆 黑名單
賣貨便三日內未結帳 黑名單
賣貨便未取貨 黑名單`
  );
  const [copied, setCopied] = useState(false);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(figures.map((f) => f.id)));
  const deselectAll = () => setSelected(new Set());

  const selectedFigures = figures.filter((f) => selected.has(f.id));

  const generateSellArticle = () => {
    if (selectedFigures.length === 0) return "";

    const names = selectedFigures
      .map((f, i) => `${i + 1}. ${f.name}`)
      .join("\n");

    const prices = selectedFigures
      .map((f, i) => `${i + 1}. ${f.price.toLocaleString()}`)
      .join("\n");

    const conditions = selectedFigures
      .map((f, i) => `${i + 1}. ${f.condition}`)
      .join("\n");

    const sellShippingDetails: Record<string, string> = {
      賣貨便: "賣貨便",
      郵寄: "匯款後郵寄（只能週六寄出）",
      黑貓: "匯款後黑貓（只能週六寄出）",
    };

    const shippingMethods = selectedFigures
      .map((f, i) => `${i + 1}. ${sellShippingDetails[f.shippingMethod] ?? f.shippingMethod}`)
      .join("\n");

    return `【多社同步】【售】

【模型名稱】：
${names}

【商品價格】：
${prices}

【商品狀況】：
${conditions}

【說明】：
${description}

【交易方式】：
${shippingMethods}

【備註】：
${note}

【參考網址】： https://figurehub.xyz/
此為自架網站，非詐騙，請放心`;
  };

  const generateBidArticle = () => {
    if (selectedFigures.length === 0) return "";

    const items = selectedFigures
      .map((f, i) => `${i + 1}. ${f.name}`)
      .join("\n");

    const endTimes = selectedFigures
      .map((_, i) => `${i + 1}. ${bidEndTime}`)
      .join("\n");

    const startPrices = selectedFigures
      .map((f, i) => `${i + 1}. $${f.price.toLocaleString()}`)
      .join("\n");

    const shippingDetails: Record<string, string> = {
      賣貨便: "賣貨便",
      郵寄: "匯款後郵寄 +100（只能週六寄出）",
      黑貓: "匯款後黑貓宅急便 運費一律+200（只能週六寄出）（怕被壓爛的人建議黑貓）",
    };

    const shippingMethods = selectedFigures
      .map((f, i) => `${i + 1}. ${shippingDetails[f.shippingMethod] ?? f.shippingMethod}`)
      .join("\n");

    return `【競標文】

【模型名稱】
${items}

【結標時間】
${endTimes}

【起標金額】
${startPrices}

【增標金額】
10$ 或倍數

【說明】
${bidDescription}

【交易方式】
${shippingMethods}

【結標時間】
結標前 5 分鐘出價，則結標時間自動延長 5 分鐘，直到無人出價為止。
例.
同好A 在 21:59:00 出價，則結標時間就從 22:00:59 遞延成 22:05:59。
同好B 在 22:01:00 出價，結標遞延到 22:10；
同好A 在 22:04:00 追價後再無人出價
，到 22:10:59 結束即為 A 得標。
一切以賣家裝置上看到的留言時間為判定依據

【備註】
${bidNote}

【參考網址】： https://figurehub.xyz/
此為自架網站，非詐騙，請放心`;
  };

  const generateArticle = () => {
    return articleType === "sell" ? generateSellArticle() : generateBidArticle();
  };

  const article = generateArticle();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 文章類型切換 */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setArticleType("sell"); setSelected(getDefaultSelected(figures, "sell")); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            articleType === "sell"
              ? "bg-[var(--accent)] text-white"
              : "border border-[var(--card-border)] hover:border-[var(--accent)]"
          }`}
        >
          售出文
        </button>
        <button
          type="button"
          onClick={() => { setArticleType("bid"); setSelected(getDefaultSelected(figures, "bid")); }}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            articleType === "bid"
              ? "bg-[var(--accent)] text-white"
              : "border border-[var(--card-border)] hover:border-[var(--accent)]"
          }`}
        >
          競標文
        </button>
      </div>

      {/* 選擇模型 */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">選擇要刊登的模型</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="rounded border border-[var(--card-border)] px-2 py-1 text-xs hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors"
            >
              全選
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="rounded border border-[var(--card-border)] px-2 py-1 text-xs hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-colors"
            >
              取消全選
            </button>
          </div>
        </div>
        {figures.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/40">目前沒有未售出的模型</p>
        ) : (
          <div className="space-y-2">
            {figures.map((fig) => (
              <label
                key={fig.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] px-3 py-2 cursor-pointer hover:border-[var(--accent)] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(fig.id)}
                  onChange={() => toggle(fig.id)}
                  className="accent-[var(--accent)]"
                />
                <span className="flex-1 text-sm">{fig.name}</span>
                <span className="text-xs text-[var(--foreground)]/60">
                  NT${fig.price.toLocaleString()}
                </span>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                    fig.condition === "全新未拆"
                      ? "bg-[var(--tag-new)]"
                      : "bg-[var(--tag-opened)]"
                  }`}
                >
                  {fig.condition}
                </span>
                <span
                  className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                    fig.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
                  }`}
                >
                  {fig.saleMethod}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 自訂欄位 */}
      {articleType === "sell" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <label className="mb-2 block text-sm font-semibold">說明</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <label className="mb-2 block text-sm font-semibold">備註</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <label className="mb-2 block text-sm font-semibold">結標時間</label>
            <input
              type="text"
              value={bidEndTime}
              onChange={(e) => setBidEndTime(e.target.value)}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <label className="mb-2 block text-sm font-semibold">說明</label>
            <textarea
              value={bidDescription}
              onChange={(e) => setBidDescription(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
          <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <label className="mb-2 block text-sm font-semibold">備註</label>
            <textarea
              value={bidNote}
              onChange={(e) => setBidNote(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 預覽 & 複製 */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">預覽文章</h2>
          <button
            type="button"
            onClick={handleCopy}
            disabled={selectedFigures.length === 0}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? "✓ 已複製" : "複製文章"}
          </button>
        </div>
        {selectedFigures.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/40">請至少勾選一個模型</p>
        ) : (
          <pre className="whitespace-pre-wrap rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 text-sm leading-relaxed">
            {article}
          </pre>
        )}
      </div>
    </div>
  );
}
