import { db } from "@/lib/db";
import { figures as figuresTable, figureMedia } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export type FigureCondition = "全新未拆" | "拆擺";
export type BoxCondition = "佳" | "普通" | "差" | "無盒";
export type ShippingMethod = "賣貨便" | "郵寄" | "黑貓";

export interface FigureMedia {
  type: "image" | "video";
  url: string;
}

export interface Figure {
  id: string;
  name: string;
  price: number;
  condition: FigureCondition;
  boxCondition: BoxCondition;
  shippingMethod: ShippingMethod;
  sold: boolean;
  media: FigureMedia[];
  description?: string;
  driveFolderUrl?: string;
}

export async function getAllFigures(): Promise<Figure[]> {
  const rows = await db.select().from(figuresTable).orderBy(asc(figuresTable.createdAt));

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

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    price: row.price,
    condition: row.condition,
    boxCondition: row.boxCondition,
    shippingMethod: row.shippingMethod,
    sold: row.sold,
    media: mediaByFigure.get(row.id) ?? [],
    description: row.description ?? undefined,
    driveFolderUrl: row.driveFolderUrl ?? undefined,
  }));
}

export async function getFigureById(id: string): Promise<Figure | null> {
  const [row] = await db
    .select()
    .from(figuresTable)
    .where(eq(figuresTable.id, id))
    .limit(1);

  if (!row) return null;

  const media = await db
    .select()
    .from(figureMedia)
    .where(eq(figureMedia.figureId, id))
    .orderBy(asc(figureMedia.sortOrder));

  return {
    id: row.id,
    name: row.name,
    price: row.price,
    condition: row.condition,
    boxCondition: row.boxCondition,
    shippingMethod: row.shippingMethod,
    sold: row.sold,
    media: media.map((m) => ({ type: m.type, url: m.url })),
    description: row.description ?? undefined,
    driveFolderUrl: row.driveFolderUrl ?? undefined,
  };
}
