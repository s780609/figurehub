import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, figures } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { aesDecrypt } from "@/lib/ecpay";

// 來源：SNAPSHOT 2026-03 | guides/02a-ecpg-quickstart.md 步驟 5
//
// OrderResultURL — 消費者瀏覽器跳轉
// 3D Secure OTP 驗證後，ECPay 可能用 302/303 redirect 回此 URL（變成 GET）
// 或直接 Form POST（Content-Type: application/x-www-form-urlencoded）
// 兩種 method 都要處理

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

async function handleResult(resultDataStr: string | null): Promise<NextResponse> {
  let figureId = "";
  let paymentStatus = "failed";

  try {
    if (resultDataStr) {
      const outer = JSON.parse(resultDataStr);
      console.log("[ECPay Result] outer:", JSON.stringify(outer));

      if (Number(outer.TransCode) === 1 && outer.Data) {
        const data = aesDecrypt(outer.Data) as Record<string, any>;
        console.log("[ECPay Result] decrypted:", JSON.stringify(data));
        const merchantTradeNo = data.MerchantTradeNo as string;

        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.merchantTradeNo, merchantTradeNo))
          .limit(1);

        console.log("[ECPay Result] order:", order?.id, "status:", order?.status);

        if (order) {
          figureId = order.figureId;
          if (Number(data.RtnCode) === 1 || order.status === "paid") {
            paymentStatus = "success";
            // 備援：若 S2S callback 未到，在此也更新 DB
            if (order.status !== "paid" && Number(data.RtnCode) === 1) {
              await db
                .update(orders)
                .set({
                  status: "paid",
                  ecpayTradeNo: (data.TradeNo as string) || null,
                  paidAt: new Date(),
                })
                .where(eq(orders.id, order.id));
              await db
                .update(figures)
                .set({ soldStatus: "已售出" })
                .where(eq(figures.id, order.figureId));
              console.log("[ECPay Result] DB updated to paid (backup), figureId:", order.figureId);
            }
          }
        }
      }
    }
  } catch (err) {
    console.error("[ECPay Result] handleResult error:", err);
  }

  const target = figureId
    ? `${siteUrl}/figure/${figureId}?payment=${paymentStatus}`
    : `${siteUrl}/?payment=${paymentStatus}`;

  return NextResponse.redirect(target, 303);
}

// 備援：3D redirect GET 無 ResultData，用 merchantTradeNo 查 DB
async function handleResultByMtn(merchantTradeNo: string): Promise<NextResponse> {
  let figureId = "";
  let paymentStatus = "failed";

  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.merchantTradeNo, merchantTradeNo))
      .limit(1);

    if (order) {
      figureId = order.figureId;
      // S2S callback 可能已更新為 paid
      if (order.status === "paid") {
        paymentStatus = "success";
      } else {
        // callback 尚未到達，等 2 秒後再查一次
        await new Promise((r) => setTimeout(r, 2000));
        const [refreshed] = await db
          .select()
          .from(orders)
          .where(eq(orders.merchantTradeNo, merchantTradeNo))
          .limit(1);
        if (refreshed?.status === "paid") {
          paymentStatus = "success";
        } else {
          // callback 未到，先標記 pending 讓使用者知道付款處理中
          paymentStatus = "pending";
        }
      }
    }
  } catch {
    // fallback
  }

  const target = figureId
    ? `${siteUrl}/figure/${figureId}?payment=${paymentStatus}`
    : `${siteUrl}/?payment=${paymentStatus}`;

  return NextResponse.redirect(target, 303);
}

// POST: ECPay Form POST 跳轉
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const resultDataStr = formData.get("ResultData") as string | null;
  return handleResult(resultDataStr);
}

// GET: 3D Secure OTP 完成後 302/303 redirect 回來（method 變 GET，不帶 ResultData）
// 改用 mtn query param 查 DB 狀態
export async function GET(req: NextRequest) {
  const resultDataStr = req.nextUrl.searchParams.get("ResultData");
  if (resultDataStr) {
    return handleResult(resultDataStr);
  }

  // 3D redirect 不帶 ResultData，用 mtn 查 DB
  const mtn = req.nextUrl.searchParams.get("mtn");
  if (mtn) {
    return handleResultByMtn(mtn);
  }

  return NextResponse.redirect(`${siteUrl}/?payment=failed`, 303);
}
