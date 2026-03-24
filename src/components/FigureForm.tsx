"use client";

import { useState } from "react";
import type { Figure } from "@/data/figures";

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

function getDefaultBidEndTime(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, "0");
  const d = String(tomorrow.getDate()).padStart(2, "0");
  const w = weekDays[tomorrow.getDay()];
  return `${y}/${m}/${d} (週${w}) 晚上 22:00:00`;
}

/** 嘗試解析 "2026/03/25 (週三) 晚上 22:00:00" 格式的時間 */
function parseBidEndTime(s: string): Date | null {
  const match = s.match(/^(\d{4})\/(\d{2})\/(\d{2}).*?(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, y, mo, d, h, mi, sec] = match;
  return new Date(+y, +mo - 1, +d, +h, +mi, +sec);
}

interface Props {
  action: (formData: FormData) => void;
  figure?: Figure;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
}

export default function FigureForm({ action, figure }: Props) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(
    figure?.media ?? []
  );
  const [saleMethod, setSaleMethod] = useState(figure?.saleMethod ?? "出售");
  const [price, setPrice] = useState(figure?.price?.toString() ?? "");
  const [dealPrice, setDealPrice] = useState(figure?.dealPrice?.toString() ?? (figure?.saleMethod === "出售" ? figure?.price?.toString() ?? "" : ""));
  const [soldStatus, setSoldStatus] = useState(figure?.soldStatus ?? "未售出");
  const [bidEndTime, setBidEndTime] = useState(figure?.bidEndTime ?? getDefaultBidEndTime());
  const [folderUrl, setFolderUrl] = useState(figure?.driveFolderUrl ?? "");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [formError, setFormError] = useState("");

  // 出售模式：價格變動時連動成交價格
  const handlePriceChange = (val: string) => {
    setPrice(val);
    if (saleMethod === "出售") {
      setDealPrice(val);
    }
  };

  // 切換銷售方式時
  const handleSaleMethodChange = (val: "出售" | "競標") => {
    setSaleMethod(val);
    if (val === "出售") {
      setDealPrice(price);
    } else {
      setDealPrice("");
    }
  };

  // 表單提交前驗證
  function validate(): string | null {
    if (saleMethod === "競標") {
      if (!bidEndTime.trim()) {
        return "競標模式下，結標時間不可為空";
      }
      const endDate = parseBidEndTime(bidEndTime);
      if (!endDate) {
        return "結標時間格式無法辨識，請使用格式：2026/03/25 (週三) 晚上 22:00:00";
      }
      const now = new Date();
      const isEnded = now > endDate;

      if (isEnded) {
        // 已結標：必須有成交價格，售出狀態必須為已售出
        if (!dealPrice.trim()) {
          return "已過結標時間，必須填寫成交價格";
        }
        if (soldStatus !== "已售出") {
          return "已過結標時間，售出狀態必須為「已售出」";
        }
      } else {
        // 未結標：成交價格可為空，售出狀態須為未售出或準備中
        if (soldStatus === "已售出") {
          return "尚未結標，售出狀態不可為「已售出」";
        }
      }
    }
    return null;
  }

  async function fetchFolder() {
    if (!folderUrl.trim()) return;
    setFetching(true);
    setFetchError("");

    try {
      const res = await fetch("/api/drive/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderUrl }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFetchError(data.error ?? "抓取失敗");
        return;
      }

      const files: MediaItem[] = data.files.map((f: { type: string; url: string }) => ({
        type: f.type,
        url: f.url,
      }));

      if (files.length === 0) {
        setFetchError("資料夾內沒有找到圖片或影片，請確認資料夾已公開分享");
        return;
      }

      setMediaList(files);
    } catch {
      setFetchError("網路錯誤，請稍後再試");
    } finally {
      setFetching(false);
    }
  }

  function addMedia() {
    setMediaList([...mediaList, { type: "image", url: "" }]);
  }

  function removeMedia(index: number) {
    setMediaList(mediaList.filter((_, i) => i !== index));
  }

  function updateMedia(index: number, field: "type" | "url", value: string) {
    const updated = [...mediaList];
    if (field === "type") {
      updated[index] = { ...updated[index], type: value as "image" | "video" };
    } else {
      updated[index] = { ...updated[index], url: value };
    }
    setMediaList(updated);
  }

  return (
    <form
      action={(formData) => {
        const err = validate();
        if (err) {
          setFormError(err);
          return;
        }
        setFormError("");
        formData.set("media", JSON.stringify(mediaList.filter((m) => m.url.trim())));
        formData.set("driveFolderUrl", folderUrl);
        formData.set("dealPrice", saleMethod === "出售" ? price : dealPrice);
        action(formData);
      }}
      className="space-y-5"
    >
      {/* 錯誤提示 */}
      {formError && (
        <div className="rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {formError}
        </div>
      )}

      {/* 名稱 */}
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium">
          模型名稱 *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={figure?.name}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* 價格 & 成交價格 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="price" className="mb-1 block text-sm font-medium">
            價格 (NT$) *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min={0}
            required
            value={price}
            onChange={(e) => handlePriceChange(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label htmlFor="dealPrice" className="mb-1 block text-sm font-medium">
            成交價格 (NT$)
          </label>
          <input
            id="dealPrice"
            name="dealPrice"
            type="number"
            min={0}
            value={dealPrice}
            onChange={(e) => setDealPrice(e.target.value)}
            disabled={saleMethod === "出售"}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* 狀態 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="condition" className="mb-1 block text-sm font-medium">
            狀態 *
          </label>
          <select
            id="condition"
            name="condition"
            required
            defaultValue={figure?.condition ?? "拆擺"}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="全新未拆">全新未拆</option>
            <option value="拆擺">拆擺</option>
          </select>
        </div>
        <div>
          <label htmlFor="boxCondition" className="mb-1 block text-sm font-medium">
            盒況 *
          </label>
          <select
            id="boxCondition"
            name="boxCondition"
            required
            defaultValue={figure?.boxCondition ?? "佳"}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="佳">佳</option>
            <option value="普通">普通</option>
            <option value="差">差</option>
            <option value="無盒">無盒</option>
          </select>
        </div>
      </div>

      {/* 銷售方式 & 交易方式 & 售出狀態 */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="saleMethod" className="mb-1 block text-sm font-medium">
            銷售方式 *
          </label>
          <select
            id="saleMethod"
            name="saleMethod"
            required
            value={saleMethod}
            onChange={(e) => handleSaleMethodChange(e.target.value as "出售" | "競標")}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="出售">出售</option>
            <option value="競標">競標</option>
          </select>
        </div>
        <div>
          <label htmlFor="shippingMethod" className="mb-1 block text-sm font-medium">
            交易方式 *
          </label>
          <select
            id="shippingMethod"
            name="shippingMethod"
            required
            defaultValue={figure?.shippingMethod ?? "賣貨便"}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="賣貨便">賣貨便</option>
            <option value="郵寄">郵寄</option>
            <option value="黑貓">黑貓</option>
          </select>
        </div>
        <div>
          <label htmlFor="soldStatus" className="mb-1 block text-sm font-medium">
            售出狀態 *
          </label>
          <select
            id="soldStatus"
            name="soldStatus"
            required
            value={soldStatus}
            onChange={(e) => setSoldStatus(e.target.value as "未售出" | "準備中" | "已售出")}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          >
            <option value="未售出">未售出</option>
            <option value="準備中">準備中</option>
            <option value="已售出">已售出</option>
          </select>
        </div>
      </div>

      {/* 結標時間（僅競標） */}
      {saleMethod === "競標" && (
        <div>
          <label htmlFor="bidEndTime" className="mb-1 block text-sm font-medium">
            結標時間 *
          </label>
          <input
            id="bidEndTime"
            name="bidEndTime"
            type="text"
            required
            value={bidEndTime}
            onChange={(e) => setBidEndTime(e.target.value)}
            placeholder="例：2026/03/25 (週三) 晚上 22:00:00"
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
        </div>
      )}

      {/* 說明 */}
      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium">
          說明
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={figure?.description}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)] resize-y"
        />
      </div>

      {/* Google Drive 資料夾 */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Google Drive 資料夾連結
        </label>
        <p className="mb-2 text-xs text-[var(--foreground)]/50">
          貼上資料夾共用連結，點「抓取」自動匯入裡面的照片與影片
        </p>
        <div className="flex gap-2">
          <input
            type="url"
            value={folderUrl}
            onChange={(e) => setFolderUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          />
          <button
            type="button"
            onClick={fetchFolder}
            disabled={fetching || !folderUrl.trim()}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
          >
            {fetching ? "抓取中..." : "抓取"}
          </button>
        </div>
        {fetchError && (
          <p className="mt-2 text-sm text-red-500">{fetchError}</p>
        )}
      </div>

      {/* 媒體列表 */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">
            照片/影片（{mediaList.length} 個）
          </label>
          <button
            type="button"
            onClick={addMedia}
            className="rounded border border-[var(--accent)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
          >
            + 手動新增
          </button>
        </div>

        {mediaList.length === 0 && (
          <p className="text-sm text-[var(--foreground)]/40">
            尚未新增任何媒體，請貼上資料夾連結並點「抓取」
          </p>
        )}

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {mediaList.map((m, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="shrink-0 w-6 text-center text-xs text-[var(--foreground)]/40">
                {i + 1}
              </span>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium text-white ${
                  m.type === "image" ? "bg-blue-500" : "bg-purple-500"
                }`}
              >
                {m.type === "image" ? "圖" : "影"}
              </span>
              <input
                type="text"
                value={m.url}
                onChange={(e) => updateMedia(i, "url", e.target.value)}
                placeholder="Google Drive 連結"
                className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs outline-none focus:border-[var(--accent)] truncate"
              />
              <select
                value={m.type}
                onChange={(e) => updateMedia(i, "type", e.target.value)}
                className="shrink-0 rounded border border-[var(--card-border)] bg-[var(--background)] px-1 py-1.5 text-xs outline-none"
              >
                <option value="image">照片</option>
                <option value="video">影片</option>
              </select>
              <button
                type="button"
                onClick={() => removeMedia(i)}
                className="shrink-0 rounded border border-red-500 px-1.5 py-1 text-xs text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        {figure ? "儲存變更" : "新增模型"}
      </button>
    </form>
  );
}
