import { db } from "@/lib/db";
import { figures as figuresTable, figureMedia, users } from "@/lib/schema";
import { eq, asc, desc, and, isNull, count, inArray, sql } from "drizzle-orm";

export type FigureCondition = "全新未拆" | "拆擺";
export type BoxCondition = "佳" | "普通" | "差" | "無盒";
export type ShippingMethod = "賣貨便" | "郵寄" | "黑貓";
export type SaleMethod = "出售" | "競標";
export type SoldStatus = "未售出" | "準備中" | "已售出";

export interface FigureMedia {
  type: "image" | "video";
  url: string;
}

export interface Figure {
  id: string;
  userId?: string;
  ownerEmail?: string;
  name: string;
  price: number;
  condition: FigureCondition;
  boxCondition: BoxCondition;
  shippingMethod: ShippingMethod;
  saleMethod: SaleMethod;
  bidEndTime?: string;
  dealPrice?: number;
  /** 成交日期，格式 YYYY-MM-DD */
  dealDate?: string;
  soldStatus: SoldStatus;
  media: FigureMedia[];
  description?: string;
  driveFolderUrl?: string;
}

function mapRow(row: typeof figuresTable.$inferSelect, media: FigureMedia[], ownerEmail?: string): Figure {
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    ownerEmail,
    name: row.name,
    price: row.price,
    condition: row.condition,
    boxCondition: row.boxCondition,
    shippingMethod: row.shippingMethod,
    saleMethod: row.saleMethod,
    bidEndTime: row.bidEndTime ?? undefined,
    dealPrice: row.dealPrice ?? undefined,
    dealDate: row.dealDate ?? undefined,
    soldStatus: row.soldStatus,
    media,
    description: row.description ?? undefined,
    driveFolderUrl: row.driveFolderUrl ?? undefined,
  };
}

async function buildMediaMap(): Promise<Map<string, FigureMedia[]>> {
  const allMedia = await db
    .select()
    .from(figureMedia)
    .orderBy(asc(figureMedia.sortOrder));

  const mediaByFigure = new Map<string, FigureMedia[]>();
  for (const m of allMedia) {
    const list = mediaByFigure.get(m.figureId) ?? [];
    list.push({ type: m.type, url: m.url });
    mediaByFigure.set(m.figureId, list);
  }
  return mediaByFigure;
}

/** 後台用：取得某使用者的所有模型（含未認領的） */
export async function getAllFigures(userId: string): Promise<Figure[]> {
  const rows = await db
    .select()
    .from(figuresTable)
    .where(eq(figuresTable.userId, userId))
    .orderBy(asc(figuresTable.createdAt));

  const mediaByFigure = await buildMediaMap();
  return rows.map((row) => mapRow(row, mediaByFigure.get(row.id) ?? []));
}

/** 後台用：取得某使用者的未售出模型 */
export async function getUnsoldFigures(userId: string): Promise<Figure[]> {
  const rows = await db
    .select()
    .from(figuresTable)
    .where(
      and(
        eq(figuresTable.userId, userId),
        eq(figuresTable.soldStatus, "未售出"),
      )
    )
    .orderBy(asc(figuresTable.createdAt));

  const mediaByFigure = await buildMediaMap();
  return rows.map((row) => mapRow(row, mediaByFigure.get(row.id) ?? []));
}

/** 前台用：依 slug 取得某使用者的所有模型 */
export async function getFiguresBySlug(slug: string): Promise<Figure[]> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);

  if (!user) return [];

  const rows = await db
    .select()
    .from(figuresTable)
    .where(eq(figuresTable.userId, user.id))
    .orderBy(asc(figuresTable.createdAt));

  const mediaByFigure = await buildMediaMap();
  return rows.map((row) => mapRow(row, mediaByFigure.get(row.id) ?? []));
}

/** 前台用：依 slug 取得使用者資訊 */
export async function getUserBySlug(slug: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.slug, slug))
    .limit(1);

  return user ?? null;
}

/** 前台用：依 id 取得使用者資訊 */
export async function getUserById(id: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
}

/** 取得單一模型 */
export async function getFigureById(id: string): Promise<Figure | null> {
  const [row] = await db
    .select()
    .from(figuresTable)
    .where(eq(figuresTable.id, id))
    .limit(1);

  if (!row) return null;

  // 查 owner email（信用卡功能權限判斷用）
  let ownerEmail: string | undefined;
  if (row.userId) {
    const [user] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.id, row.userId))
      .limit(1);
    ownerEmail = user?.email;
  }

  const media = await db
    .select()
    .from(figureMedia)
    .where(eq(figureMedia.figureId, id))
    .orderBy(asc(figureMedia.sortOrder));

  return mapRow(row, media.map((m) => ({ type: m.type, url: m.url })), ownerEmail);
}

export interface Seller {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string | null;
  figureCount: number;
}

/** 前台首頁用：取得所有有上架商品的賣家 */
export async function getAllSellers(): Promise<Seller[]> {
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      slug: users.slug,
      avatarUrl: users.avatarUrl,
      figureCount: count(figuresTable.id),
    })
    .from(users)
    .innerJoin(figuresTable, eq(figuresTable.userId, users.id))
    .groupBy(users.id, users.name, users.slug, users.avatarUrl);

  return rows;
}

export interface SoldFigure {
  id: string;
  name: string;
  price: number;
  dealPrice: number | null;
  condition: FigureCondition;
  boxCondition: BoxCondition;
  saleMethod: SaleMethod;
  sellerName: string;
  sellerSlug: string;
  imageUrl: string | null;
  /** 成交日期，格式 YYYY-MM-DD */
  dealDate: string | null;
}

export type SoldSort = "latest" | "priceAsc" | "priceDesc";

const SOLD_PAGE_SIZE = 24;

/** 前台首頁用：分頁取得已售出的模型（含賣家資訊與首張照片） */
export async function getSoldFigures(
  offset = 0,
  sort: SoldSort = "latest",
): Promise<{ items: SoldFigure[]; hasMore: boolean }> {
  // 成交價格：無 dealPrice 則用原價
  const dealPrice = sql<number>`coalesce(${figuresTable.dealPrice}, ${figuresTable.price})`;
  const priceOrder =
    sort === "priceAsc" ? [asc(dealPrice)] : sort === "priceDesc" ? [desc(dealPrice)] : [];

  const rows = await db
    .select({
      id: figuresTable.id,
      name: figuresTable.name,
      price: figuresTable.price,
      dealPrice: figuresTable.dealPrice,
      condition: figuresTable.condition,
      boxCondition: figuresTable.boxCondition,
      saleMethod: figuresTable.saleMethod,
      dealDate: figuresTable.dealDate,
      sellerName: users.name,
      sellerSlug: users.slug,
    })
    .from(figuresTable)
    .innerJoin(users, eq(figuresTable.userId, users.id))
    .where(eq(figuresTable.soldStatus, "已售出"))
    .orderBy(...priceOrder, desc(figuresTable.createdAt), desc(figuresTable.id))
    .limit(SOLD_PAGE_SIZE + 1)
    .offset(offset);

  const pageRows = rows.slice(0, SOLD_PAGE_SIZE);

  const firstImage = new Map<string, string>();
  if (pageRows.length > 0) {
    const media = await db
      .select({ figureId: figureMedia.figureId, url: figureMedia.url })
      .from(figureMedia)
      .where(
        and(
          inArray(figureMedia.figureId, pageRows.map((r) => r.id)),
          eq(figureMedia.type, "image"),
        )
      )
      .orderBy(asc(figureMedia.sortOrder));
    for (const m of media) {
      if (!firstImage.has(m.figureId)) firstImage.set(m.figureId, m.url);
    }
  }

  return {
    items: pageRows.map((r) => ({
      ...r,
      imageUrl: firstImage.get(r.id) ?? null,
    })),
    hasMore: rows.length > SOLD_PAGE_SIZE,
  };
}

/** Sitemap 用：取得所有模型的 id、slug、建立時間 */
export async function getAllFiguresForSitemap() {
  const rows = await db
    .select({
      id: figuresTable.id,
      slug: users.slug,
      createdAt: figuresTable.createdAt,
    })
    .from(figuresTable)
    .innerJoin(users, eq(figuresTable.userId, users.id));

  return rows;
}

/** 取得未認領模型數量 */
export async function getUnclaimedFiguresCount(): Promise<number> {
  const rows = await db
    .select()
    .from(figuresTable)
    .where(isNull(figuresTable.userId));

  return rows.length;
}
