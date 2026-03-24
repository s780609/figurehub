"use server";

import { db } from "@/lib/db";
import { figures, figureMedia } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyAuth, signIn, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// ---------- Auth ----------

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const ok = await signIn(username, password);
  if (!ok) {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await signOut();
  redirect("/admin/login");
}

// ---------- Figures CRUD ----------

interface MediaInput {
  type: "image" | "video";
  url: string;
}

export async function createFigure(formData: FormData) {
  if (!(await verifyAuth())) redirect("/admin/login");

  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const condition = formData.get("condition") as "全新未拆" | "拆擺";
  const boxCondition = formData.get("boxCondition") as "佳" | "普通" | "差" | "無盒";
  const shippingMethod = formData.get("shippingMethod") as "賣貨便" | "郵寄" | "黑貓";
  const saleMethod = formData.get("saleMethod") as "出售" | "競標";
  const bidEndTime = (formData.get("bidEndTime") as string) || null;
  const soldStatus = formData.get("soldStatus") as "未售出" | "準備中" | "已售出";
  const description = (formData.get("description") as string) || null;
  const driveFolderUrl = (formData.get("driveFolderUrl") as string) || null;
  const mediaJson = formData.get("media") as string;
  const mediaList: MediaInput[] = mediaJson ? JSON.parse(mediaJson) : [];

  const [inserted] = await db
    .insert(figures)
    .values({ name, price, condition, boxCondition, shippingMethod, saleMethod, bidEndTime, soldStatus, description, driveFolderUrl })
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
  if (!(await verifyAuth())) redirect("/admin/login");

  const name = formData.get("name") as string;
  const price = parseInt(formData.get("price") as string, 10);
  const condition = formData.get("condition") as "全新未拆" | "拆擺";
  const boxCondition = formData.get("boxCondition") as "佳" | "普通" | "差" | "無盒";
  const shippingMethod = formData.get("shippingMethod") as "賣貨便" | "郵寄" | "黑貓";
  const saleMethod = formData.get("saleMethod") as "出售" | "競標";
  const bidEndTime = (formData.get("bidEndTime") as string) || null;
  const soldStatus = formData.get("soldStatus") as "未售出" | "準備中" | "已售出";
  const description = (formData.get("description") as string) || null;
  const driveFolderUrl = (formData.get("driveFolderUrl") as string) || null;
  const mediaJson = formData.get("media") as string;
  const mediaList: MediaInput[] = mediaJson ? JSON.parse(mediaJson) : [];

  await db
    .update(figures)
    .set({ name, price, condition, boxCondition, shippingMethod, saleMethod, bidEndTime, soldStatus, description, driveFolderUrl })
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
  if (!(await verifyAuth())) redirect("/admin/login");

  await db.delete(figures).where(eq(figures.id, id));

  revalidatePath("/");
  redirect("/admin");
}
