import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, figures } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { verifyCheckMacValue } from "@/lib/ecpay";

// AIO 金流 ReturnURL — ECPay S2S Form POST callback
// ⚠️ Content-Type: application/x-www-form-urlencoded
// ⚠️ RtnCode 是字串 '1'（不是整數 1）
// ⚠️ 回應必須為精確的 ASCII 純文字 1|OK（HTTP 200），否則觸發最多每日 4 次重試
// ⚠️ 冪等處理：以 merchantTradeNo 為 key，已 paid 的不重複處理
// 來源：guides/01-payment-aio.md 步驟 3

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });

    console.log("[ECPay Callback] received:", JSON.stringify(params));

    // 驗證 CheckMacValue（timing-safe）
    if (!verifyCheckMacValue(params)) {
      console.error("[ECPay Callback] CheckMacValue 驗證失敗");
      return new Response("1|OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // ⚠️ AIO RtnCode 是字串 '1'
    const rtnCode = params.RtnCode;
    const merchantTradeNo = params.MerchantTradeNo;
    const tradeNo = params.TradeNo;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.merchantTradeNo, merchantTradeNo))
      .limit(1);

    console.log(
      "[ECPay Callback] order found:",
      order?.id,
      "status:",
      order?.status,
      "rtnCode:",
      rtnCode
    );

    if (order && order.status !== "paid") {
      if (rtnCode === "1") {
        await db
          .update(orders)
          .set({
            status: "paid",
            ecpayTradeNo: tradeNo,
            paidAt: new Date(),
          })
          .where(eq(orders.id, order.id));
        await db
          .update(figures)
          .set({ soldStatus: "已售出" })
          .where(eq(figures.id, order.figureId));
        console.log(
          "[ECPay Callback] DB updated to paid, figureId:",
          order.figureId
        );
      } else {
        await db
          .update(orders)
          .set({ status: "failed" })
          .where(eq(orders.id, order.id));
        console.log("[ECPay Callback] DB updated to failed, rtnCode:", rtnCode);
      }
    }
  } catch (err) {
    console.error("[ECPay Callback] error:", err);
  }

  return new Response("1|OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
