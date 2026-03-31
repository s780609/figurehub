import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, figures } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyCheckMacValue, queryTrade } from "@/lib/ecpay";

// AIO 金流 OrderResultURL — 消費者瀏覽器跳轉（Form POST 帶付款結果）
// ⚠️ 不需要回應 1|OK（這是前端跳轉，不是 S2S）
// ⚠️ AIO RtnCode 是字串 '1'
// 來源：guides/01-payment-aio.md

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** 從 order 查出 figure 所屬的 user slug，用來組 redirect URL */
async function getFigureRedirectPath(order: {
  figureId: string;
}): Promise<string> {
  const [fig] = await db
    .select({ userId: figures.userId })
    .from(figures)
    .where(eq(figures.id, order.figureId))
    .limit(1);

  if (fig?.userId) {
    const { users } = await import("@/lib/schema");
    const [user] = await db
      .select({ slug: users.slug })
      .from(users)
      .where(eq(users.id, fig.userId))
      .limit(1);
    if (user) return `/u/${user.slug}/figure/${order.figureId}`;
  }
  return "";
}

// POST: AIO OrderResultURL — 消費者付款完成後瀏覽器跳轉回來
export async function POST(req: NextRequest) {
  let figurePath = "";
  let paymentStatus = "failed";

  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("[ECPay Result] received:", JSON.stringify(params));

    // 驗證 CheckMacValue
    if (verifyCheckMacValue(params)) {
      const merchantTradeNo = params.MerchantTradeNo;

      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.merchantTradeNo, merchantTradeNo))
        .limit(1);

      if (order) {
        figurePath = await getFigureRedirectPath(order);

        // ⚠️ AIO RtnCode 是字串 '1'
        if (params.RtnCode === "1" || order.status === "paid") {
          paymentStatus = "success";

          // 付款確認後更新 soldStatus
          if (order.status !== "paid" && params.RtnCode === "1") {
            await db
              .update(orders)
              .set({
                status: "paid",
                ecpayTradeNo: params.TradeNo || null,
                paidAt: new Date(),
              })
              .where(eq(orders.id, order.id));
            await db
              .update(figures)
              .set({ soldStatus: "已售出" })
              .where(eq(figures.id, order.figureId));
            console.log(
              "[ECPay Result] DB updated to paid, figureId:",
              order.figureId
            );
          }
        }
      }
    } else {
      console.error("[ECPay Result] CheckMacValue 驗證失敗");
    }
  } catch (err) {
    console.error("[ECPay Result] error:", err);
  }

  const target = figurePath
    ? `${siteUrl}${figurePath}?payment=${paymentStatus}`
    : `${siteUrl}/?payment=${paymentStatus}`;

  return NextResponse.redirect(target, 303);
}

// GET: 備援 — 透過 mtn query param + QueryTrade API 確認付款狀態
// ⚠️ 不可僅憑 GET 請求就更新為 paid（mtn 參數可被偽造）
export async function GET(req: NextRequest) {
  const mtn = req.nextUrl.searchParams.get("mtn");
  let figurePath = "";
  let paymentStatus = "failed";

  if (mtn) {
    try {
      const [order] = await db
        .select()
        .from(orders)
        .where(eq(orders.merchantTradeNo, mtn))
        .limit(1);

      if (order) {
        figurePath = await getFigureRedirectPath(order);

        if (order.status === "paid") {
          paymentStatus = "success";
        } else {
          // 主動向 ECPay 查詢交易狀態（S2S，不可偽造）
          const result = await queryTrade(mtn);
          console.log("[ECPay Result] queryTrade:", JSON.stringify(result));

          if (result.paid) {
            await db
              .update(orders)
              .set({
                status: "paid",
                ecpayTradeNo: result.tradeNo || null,
                paidAt: new Date(),
              })
              .where(eq(orders.id, order.id));
            await db
              .update(figures)
              .set({ soldStatus: "已售出" })
              .where(eq(figures.id, order.figureId));
            console.log(
              "[ECPay Result] queryTrade confirmed paid, figureId:",
              order.figureId
            );
            paymentStatus = "success";
          } else {
            paymentStatus = "pending";
          }
        }
      }
    } catch (err) {
      console.error("[ECPay Result] GET error:", err);
    }
  }

  const target = figurePath
    ? `${siteUrl}${figurePath}?payment=${paymentStatus}`
    : `${siteUrl}/?payment=${paymentStatus}`;

  return NextResponse.redirect(target, 303);
}
