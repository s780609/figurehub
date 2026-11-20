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

const SITE_URL = "https://figurehub.xyz";

interface Props {
  figures: Figure[];
  slug: string;
}

function getDefaultSelected(figures: Figure[], type: ArticleType): Set<string> {
  const saleMethod = type === "sell" ? "出售" : "競標";
  return new Set(figures.filter((f) => f.saleMethod === saleMethod).map((f) => f.id));
}

export default function ArticleGenerator({ figures, slug }: Props) {
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
    setIsManuallyEdited(false);
  };

  const selectAll = () => { setSelected(new Set(figures.map((f) => f.id))); setIsManuallyEdited(false); };
  const deselectAll = () => { setSelected(new Set()); setIsManuallyEdited(false); };

  const selectedFigures = figures.filter((f) => selected.has(f.id));

  const generateSellArticle = () => {
    if (selectedFigures.length === 0) return "";

    const names = selectedFigures.map((f, i) => `${i + 1}. ${f.name}`).join("\n");
    const prices = selectedFigures.map((f, i) => `${i + 1}. ${f.price.toLocaleString()}`).join("\n");
    const conditions = selectedFigures.map((f, i) => `${i + 1}. ${f.condition}`).join("\n");

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

【參考網址】：

${SITE_URL}/u/${slug}?saleMethod=出售

此為自架網站，非詐騙，請放心，只是怕被阻`;
  };

  const generateBidArticle = () => {
    if (selectedFigures.length === 0) return "";

    const items = selectedFigures.map((f, i) => `${i + 1}. ${f.name}`).join("\n");
    const bidConditions = selectedFigures.map((f, i) => `${i + 1}. ${f.condition}`).join("\n");
    const endTimes = selectedFigures.map((_, i) => `${i + 1}. ${bidEndTime}`).join("\n");
    const startPrices = selectedFigures.map((f, i) => `${i + 1}. $${f.price.toLocaleString()}`).join("\n");

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

【模型狀況】
${bidConditions}

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

【參考網址】：

${SITE_URL}/u/${slug}?saleMethod=競標

此為自架網站，非詐騙，請放心`;
  };

  const generateArticle = () => {
    return articleType === "sell" ? generateSellArticle() : generateBidArticle();
  };

  const article = generateArticle();
  const [editedArticle, setEditedArticle] = useState(article);
  const [isManuallyEdited, setIsManuallyEdited] = useState(false);

  const displayArticle = isManuallyEdited ? editedArticle : article;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayArticle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* 文章類型切換 */}
      <div className="flex rounded-lg border border-[var(--card-border)] overflow-hidden w-fit">
        <button
          type="button"
          onClick={() => { setArticleType("sell"); setSelected(getDefaultSelected(figures, "sell")); setIsManuallyEdited(false); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            articleType === "sell"
              ? "bg-[var(--accent)] text-white"
              : "hover:bg-[var(--foreground)]/5"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          售出文
        </button>
        <button
          type="button"
          onClick={() => { setArticleType("bid"); setSelected(getDefaultSelected(figures, "bid")); setIsManuallyEdited(false); }}
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
            articleType === "bid"
              ? "bg-[var(--accent)] text-white"
              : "hover:bg-[var(--foreground)]/5"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
          競標文
        </button>
      </div>

      {/* 兩欄佈局：左邊選模型，右邊自訂欄位 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* 左欄：模型選擇 */}
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              選擇模型
              <span className="ml-2 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                {selected.size}/{figures.length}
              </span>
            </h2>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={selectAll}
                className="rounded-md border border-[var(--card-border)] px-2 py-1 text-xs hover:bg-[var(--foreground)]/5 transition-colors"
              >
                全選
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="rounded-md border border-[var(--card-border)] px-2 py-1 text-xs hover:bg-[var(--foreground)]/5 transition-colors"
              >
                清除
              </button>
            </div>
          </div>
          {figures.length === 0 ? (
            <p className="text-sm text-[var(--foreground)]/40 py-8 text-center">目前沒有未售出的模型</p>
          ) : (
            <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
              {figures.map((fig) => (
                <label
                  key={fig.id}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${
                    selected.has(fig.id)
                      ? "border-[var(--accent)]/50 bg-[var(--accent)]/5"
                      : "border-[var(--card-border)] hover:border-[var(--accent)]/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(fig.id)}
                    onChange={() => toggle(fig.id)}
                    className="accent-[var(--accent)]"
                  />
                  <span className="flex-1 text-sm truncate">{fig.name}</span>
                  <span className="text-xs text-[var(--foreground)]/50">
                    NT${fig.price.toLocaleString()}
                  </span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                    fig.condition === "全新未拆" ? "bg-[var(--tag-new)]" : "bg-[var(--tag-opened)]"
                  }`}>
                    {fig.condition}
                  </span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                    fig.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
                  }`}>
                    {fig.saleMethod}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* 右欄：自訂欄位 */}
        <div className="space-y-3">
          {articleType === "sell" ? (
            <>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <label className="mb-2 block text-sm font-semibold">說明</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <label className="mb-2 block text-sm font-semibold">備註</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <label className="mb-2 block text-sm font-semibold">結標時間</label>
                <input
                  type="text"
                  value={bidEndTime}
                  onChange={(e) => setBidEndTime(e.target.value)}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <label className="mb-2 block text-sm font-semibold">說明</label>
                <textarea
                  value={bidDescription}
                  onChange={(e) => setBidDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>
              <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                <label className="mb-2 block text-sm font-semibold">備註</label>
                <textarea
                  value={bidNote}
                  onChange={(e) => setBidNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:border-[var(--accent)] focus:outline-none transition-colors"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 預覽 & 複製 */}
      <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">
            預覽文章
            {selectedFigures.length > 0 && (
              <span className="ml-2 text-xs font-normal text-[var(--foreground)]/40">
                已選 {selectedFigures.length} 件模型
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={handleCopy}
            disabled={selectedFigures.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                已複製
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" /></svg>
                複製文章
              </>
            )}
          </button>
        </div>
        {selectedFigures.length === 0 ? (
          <p className="text-sm text-[var(--foreground)]/40 py-8 text-center">請至少勾選一個模型</p>
        ) : (
          <textarea
            value={displayArticle}
            onChange={(e) => {
              setEditedArticle(e.target.value);
              setIsManuallyEdited(true);
            }}
            className="w-full resize-y rounded-lg border border-[var(--card-border)] bg-[var(--background)] p-4 text-sm leading-relaxed min-h-[300px] focus:border-[var(--accent)] focus:outline-none transition-colors"
          />
        )}
      </div>
    </div>
  );
}
