"use client";

import { useState } from "react";
import type { Figure } from "@/data/figures";

interface Props {
  figures: Figure[];
}

export default function ArticleGenerator({ figures }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(figures.map((f) => f.id))
  );
  const [description, setDescription] = useState("拆擺 無菸環境 都放在櫃中");
  const [tradeMethod, setTradeMethod] = useState("竹北面交\n匯款7-11店到店");
  const [note, setNote] = useState("若有問題可私訊。");
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

  const generateArticle = () => {
    if (selectedFigures.length === 0) return "";

    const names = selectedFigures
      .map((f, i) => `${i + 1}. ${f.name}`)
      .join("\n\n");

    const prices = selectedFigures
      .map((f) => f.price.toLocaleString())
      .join("\n");

    const conditions = selectedFigures.map((f) => f.condition).join("\n");

    return `【多社同步】【售】
【商品名稱】：
${names}

【商品價格】：
${prices}
【商品狀況】：
${conditions}

【說明】：
${description}

【交易方式】：
${tradeMethod}
【備註】：
${note}

【參考網址】： https://figurehub.vercel.app/`;
  };

  const article = generateArticle();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(article);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
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
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 自訂欄位 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <label className="mb-2 block text-sm font-semibold">交易方式</label>
          <textarea
            value={tradeMethod}
            onChange={(e) => setTradeMethod(e.target.value)}
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
