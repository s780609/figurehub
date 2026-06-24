/**
 * 將資料庫各模組的資料匯出成 CSV 檔（輸出至 exports/ 目錄）。
 *
 * 使用方式：
 *   1. 確認 .env.local 內有 DATABASE_URL 或 POSTGRES_URL
 *   2. 執行：npm run export:csv
 *
 * 產出（每個模組一個 CSV）：
 *   - exports/preorder_figures_預購模型.csv
 *   - exports/figures_模型管理.csv      （含媒體 URL）
 *   - exports/orders_訂單.csv
 *   - exports/users_使用者.csv
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { asc } from "drizzle-orm";
import {
  users,
  figures,
  figureMedia,
  preorderFigures,
  orders,
} from "../src/lib/schema";

const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!url) {
  console.error(
    "❌ 找不到資料庫連線字串。請在 .env.local 設定 DATABASE_URL 或 POSTGRES_URL 後再執行。",
  );
  process.exit(1);
}

const db = drizzle(neon(url));

const OUT_DIR = "exports";

/** 將陣列轉成 CSV 字串（含表頭，逗號/引號/換行自動跳脫） */
function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = v instanceof Date ? v.toISOString() : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) lines.push(headers.map((h) => escape(r[h])).join(","));
  return lines.join("\r\n");
}

/** 寫出單一 CSV 檔（UTF-8 BOM，讓 Excel 正確顯示中文） */
function write(name: string, rows: Record<string, unknown>[]): void {
  mkdirSync(OUT_DIR, { recursive: true });
  const path = join(OUT_DIR, `${name}.csv`);
  writeFileSync(path, "﻿" + toCsv(rows), "utf8");
  console.log(`✅ ${path}（${rows.length} 筆）`);
}

async function main(): Promise<void> {
  // 預購模型
  const preorders = await db
    .select()
    .from(preorderFigures)
    .orderBy(asc(preorderFigures.createdAt));
  write("preorder_figures_預購模型", preorders);

  // 模型管理（把每個模型的媒體 URL 合併成一欄）
  const figureRows = await db
    .select()
    .from(figures)
    .orderBy(asc(figures.createdAt));
  const media = await db
    .select()
    .from(figureMedia)
    .orderBy(asc(figureMedia.sortOrder));
  const mediaByFigure = new Map<string, string[]>();
  for (const m of media) {
    const list = mediaByFigure.get(m.figureId) ?? [];
    list.push(m.url);
    mediaByFigure.set(m.figureId, list);
  }
  const figuresWithMedia = figureRows.map((f) => ({
    ...f,
    mediaUrls: (mediaByFigure.get(f.id) ?? []).join(" | "),
  }));
  write("figures_模型管理", figuresWithMedia);

  // 訂單
  const orderRows = await db
    .select()
    .from(orders)
    .orderBy(asc(orders.createdAt));
  write("orders_訂單", orderRows);

  // 使用者
  const userRows = await db.select().from(users).orderBy(asc(users.createdAt));
  write("users_使用者", userRows);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
