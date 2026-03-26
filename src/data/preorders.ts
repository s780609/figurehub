import { db } from "@/lib/db";
import { preorderFigures } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export interface PreorderFigure {
  id: string;
  userId?: string;
  name: string;
  releaseDate: string;
  price: number;
  arrived: boolean;
  store: string;
  platform: string;
}

function mapRow(row: typeof preorderFigures.$inferSelect): PreorderFigure {
  return {
    id: row.id,
    userId: row.userId ?? undefined,
    name: row.name,
    releaseDate: row.releaseDate,
    price: row.price,
    arrived: row.arrived,
    store: row.store,
    platform: row.platform,
  };
}

/** 取得某使用者的所有預購模型 */
export async function getAllPreorders(userId: string): Promise<PreorderFigure[]> {
  const rows = await db
    .select()
    .from(preorderFigures)
    .where(eq(preorderFigures.userId, userId))
    .orderBy(asc(preorderFigures.createdAt));

  return rows.map(mapRow);
}

/** 取得單一預購模型 */
export async function getPreorderById(id: string): Promise<PreorderFigure | null> {
  const [row] = await db
    .select()
    .from(preorderFigures)
    .where(eq(preorderFigures.id, id))
    .limit(1);

  if (!row) return null;
  return mapRow(row);
}
