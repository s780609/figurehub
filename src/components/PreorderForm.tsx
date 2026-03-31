"use client";

import { useState } from "react";
import type { PreorderFigure } from "@/data/preorders";

interface Props {
  action: (formData: FormData) => void;
  preorder?: PreorderFigure;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
);

export default function PreorderForm({ action, preorder }: Props) {
  const defaultYear = preorder
    ? preorder.releaseDate.split("-")[0]
    : String(currentYear);
  const defaultMonth = preorder
    ? preorder.releaseDate.split("-")[1]
    : String(new Date().getMonth() + 1).padStart(2, "0");

  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);
  const [arrived, setArrived] = useState(preorder?.arrived ?? false);

  return (
    <form
      action={(formData) => {
        formData.set("releaseDate", `${year}-${month}`);
        formData.set("arrived", String(arrived));
        action(formData);
      }}
      className="space-y-5"
    >
      {/* 模型名稱 */}
      <div>
        <label htmlFor="name" className="mb-1 block text-base font-medium">
          模型名稱 *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={preorder?.name}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-base outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* 發售日期（年/月） */}
      <div>
        <label className="mb-1 block text-base font-medium">發售日期 *</label>
        <div className="grid grid-cols-2 gap-4">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-base outline-none focus:border-[var(--accent)]"
          >
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y} 年
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-base outline-none focus:border-[var(--accent)]"
          >
            {months.map((m) => (
              <option key={m} value={m}>
                {parseInt(m)} 月
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 預購金額 */}
      <div>
        <label htmlFor="price" className="mb-1 block text-base font-medium">
          預購金額 (NT$) *
        </label>
        <input
          id="price"
          name="price"
          type="number"
          min={0}
          required
          defaultValue={preorder?.price}
          className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-base outline-none focus:border-[var(--accent)]"
        />
      </div>

      {/* 預購店家 & 預購平台 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="store" className="mb-1 block text-base font-medium">
            預購店家 *
          </label>
          <input
            id="store"
            name="store"
            type="text"
            required
            defaultValue={preorder?.store}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-base outline-none focus:border-[var(--accent)]"
          />
        </div>
        <div>
          <label
            htmlFor="platform"
            className="mb-1 block text-base font-medium"
          >
            預購平台 *
          </label>
          <input
            id="platform"
            name="platform"
            type="text"
            required
            defaultValue={preorder?.platform}
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-base outline-none focus:border-[var(--accent)]"
          />
        </div>
      </div>

      {/* 是否到貨 */}
      <div>
        <label className="mb-1 block text-base font-medium">是否到貨</label>
        <button
          type="button"
          onClick={() => setArrived(!arrived)}
          className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
            arrived ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
              arrived ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
        <span className="ml-3 text-base">
          {arrived ? "已到貨" : "未到貨"}
        </span>
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-base font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
      >
        {preorder ? "儲存變更" : "新增預購"}
      </button>
    </form>
  );
}
