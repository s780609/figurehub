"use server";

import { db } from "@/lib/db";
import { figures, figureMedia, preorderFigures, orders } from "@/lib/schema";
import { eq, and, isNull } from "drizzle-orm";
import { getCurrentUserId, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ---------- Auth ----------

export async function logoutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

// ---------- Figures CRUD ----------

interface MediaInput {
  type: "image" | "video";
  url: string;
}

export async function createFigure(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const condition = formData.get("condition") as "全新未拆" | "拆擺";
  const boxCondition = formData.get("boxCondition") as "佳" | "普通" | "差" | "無盒";
  const shippingMethod = formData.get("shippingMethod") as "賣貨便" | "郵寄" | "黑貓";
  const saleMethod = formData.get("saleMethod") as "出售" | "競標";
  const bidEndTime = (formData.get("bidEndTime") as string) || null;
  const dealPriceRaw = formData.get("dealPrice") as string;
  const dealPrice = dealPriceRaw ? parseInt(dealPriceRaw, 10) : null;
  const soldStatus = formData.get("soldStatus") as "未售出" | "準備中" | "已售出";
  const description = (formData.get("description") as string) || null;
  const driveFolderUrl = (formData.get("driveFolderUrl") as string) || null;
  const mediaJson = formData.get("media") as string;
  const mediaList: MediaInput[] = mediaJson ? JSON.parse(mediaJson) : [];

  const [inserted] = await db
    .insert(figures)
    .values({ userId, name, price, condition, boxCondition, shippingMethod, saleMethod, bidEndTime, dealPrice, soldStatus, description, driveFolderUrl })
    .returning();

  if (mediaList.length > 0) {
    await db.insert(figureMedia).values(
      mediaList.map((m, i) => ({
        figureId: inserted.id,
        type: m.type,
        url: m.url,
        sortOrder: i,
      }))
    );
  }

  revalidatePath("/");
  redirect("/admin");
}

export async function updateFigure(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  // 確認此模型屬於目前使用者
  const [existing] = await db.select().from(figures).where(eq(figures.id, id)).limit(1);
  if (!existing || (existing.userId && existing.userId !== userId)) {
    redirect("/admin");
  }

  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const condition = formData.get("condition") as "全新未拆" | "拆擺";
  const boxCondition = formData.get("boxCondition") as "佳" | "普通" | "差" | "無盒";
  const shippingMethod = formData.get("shippingMethod") as "賣貨便" | "郵寄" | "黑貓";
  const saleMethod = formData.get("saleMethod") as "出售" | "競標";
  const bidEndTime = (formData.get("bidEndTime") as string) || null;
  const dealPriceRaw = formData.get("dealPrice") as string;
  const dealPrice = dealPriceRaw ? parseInt(dealPriceRaw, 10) : null;
  const soldStatus = formData.get("soldStatus") as "未售出" | "準備中" | "已售出";
  const description = (formData.get("description") as string) || null;
  const driveFolderUrl = (formData.get("driveFolderUrl") as string) || null;
  const mediaJson = formData.get("media") as string;
  const mediaList: MediaInput[] = mediaJson ? JSON.parse(mediaJson) : [];

  await db
    .update(figures)
    .set({ name, price, condition, boxCondition, shippingMethod, saleMethod, bidEndTime, dealPrice, soldStatus, description, driveFolderUrl })
    .where(eq(figures.id, id));

  // 刪掉舊媒體，重新插入
  await db.delete(figureMedia).where(eq(figureMedia.figureId, id));
  if (mediaList.length > 0) {
    await db.insert(figureMedia).values(
      mediaList.map((m, i) => ({
        figureId: id,
        type: m.type,
        url: m.url,
        sortOrder: i,
      }))
    );
  }

  revalidatePath("/");
  revalidatePath(`/figure/${id}`);
  redirect("/admin");
}

export async function deleteFigure(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  // 確認此模型屬於目前使用者
  const [existing] = await db.select().from(figures).where(eq(figures.id, id)).limit(1);
  if (!existing || (existing.userId && existing.userId !== userId)) {
    redirect("/admin");
  }

  await db.delete(figures).where(eq(figures.id, id));

  revalidatePath("/");
  redirect("/admin");
}

// ---------- Preorder Figures CRUD ----------

export async function createPreorder(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const name = formData.get("name") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const arrived = formData.get("arrived") === "true";
  const store = formData.get("store") as string;
  const platform = formData.get("platform") as string;

  await db.insert(preorderFigures).values({
    userId,
    name,
    releaseDate,
    price,
    arrived,
    store,
    platform,
  });

  revalidatePath("/admin/preorders");
  redirect("/admin/preorders");
}

export async function updatePreorder(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const [existing] = await db
    .select()
    .from(preorderFigures)
    .where(eq(preorderFigures.id, id))
    .limit(1);
  if (!existing || (existing.userId && existing.userId !== userId)) {
    redirect("/admin/preorders");
  }

  const name = formData.get("name") as string;
  const releaseDate = formData.get("releaseDate") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const arrived = formData.get("arrived") === "true";
  const store = formData.get("store") as string;
  const platform = formData.get("platform") as string;

  await db
    .update(preorderFigures)
    .set({ name, releaseDate, price, arrived, store, platform })
    .where(eq(preorderFigures.id, id));

  revalidatePath("/admin/preorders");
  redirect("/admin/preorders");
}

export async function deletePreorder(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const [existing] = await db
    .select()
    .from(preorderFigures)
    .where(eq(preorderFigures.id, id))
    .limit(1);
  if (!existing || (existing.userId && existing.userId !== userId)) {
    redirect("/admin/preorders");
  }

  await db.delete(preorderFigures).where(eq(preorderFigures.id, id));

  revalidatePath("/admin/preorders");
  redirect("/admin/preorders");
}

export async function togglePreorderArrived(id: string) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const [existing] = await db
    .select()
    .from(preorderFigures)
    .where(eq(preorderFigures.id, id))
    .limit(1);
  if (!existing || (existing.userId && existing.userId !== userId)) {
    redirect("/admin/preorders");
  }

  await db
    .update(preorderFigures)
    .set({ arrived: !existing.arrived })
    .where(eq(preorderFigures.id, id));

  revalidatePath("/admin/preorders");
}

// ---------- Orders ----------

export async function updateOrderStatus(orderId: string, status: "paid" | "failed") {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const [order] = await db
    .select()
    .from(orders)
    .innerJoin(figures, eq(orders.figureId, figures.id))
    .where(eq(orders.id, orderId))
    .limit(1);

  if (!order || (order.figures.userId && order.figures.userId !== userId)) {
    redirect("/admin/orders");
  }

  if (status === "paid") {
    await db
      .update(orders)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(orders.id, orderId));
    await db
      .update(figures)
      .set({ soldStatus: "已售出" })
      .where(eq(figures.id, order.orders.figureId));
  } else {
    await db
      .update(orders)
      .set({ status: "failed" })
      .where(eq(orders.id, orderId));
  }

  revalidatePath("/admin/orders");
  revalidatePath("/");
}

// ---------- 認領現有模型 ----------

export async function claimUnownedFigures() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  await db
    .update(figures)
    .set({ userId })
    .where(isNull(figures.userId));

  revalidatePath("/");
  redirect("/admin");
}
