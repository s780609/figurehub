import { db } from "@/lib/db";
import { orders, figures } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";

export interface Order {
  id: string;
  figureId: string;
  figureName: string;
  merchantTradeNo: string;
  ecpayTradeNo: string | null;
  amount: number;
  buyerEmail: string;
  status: "pending" | "paid" | "failed";
  createdAt: Date;
  paidAt: Date | null;
}

export async function getAllOrders(userId: string): Promise<Order[]> {
  const rows = await db
    .select({
      id: orders.id,
      figureId: orders.figureId,
      figureName: figures.name,
      merchantTradeNo: orders.merchantTradeNo,
      ecpayTradeNo: orders.ecpayTradeNo,
      amount: orders.amount,
      buyerEmail: orders.buyerEmail,
      status: orders.status,
      createdAt: orders.createdAt,
      paidAt: orders.paidAt,
    })
    .from(orders)
    .innerJoin(figures, eq(orders.figureId, figures.id))
    .where(eq(figures.userId, userId))
    .orderBy(desc(orders.createdAt));

  return rows;
}
