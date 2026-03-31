import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { aesDecrypt } from "@/lib/ecpay";

// 來源：SNAPSHOT 2026-03 | guides/02a-ecpg-quickstart.md 步驟 5
//
// ReturnURL — ECPay S2S JSON POST callback
// ⚠️ 回應必須為精確的 ASCII 純文字 1|OK（HTTP 200），否則觸發最多 4 次重試
// ⚠️ 冪等處理：以 merchantTradeNo 為 key，已 paid 的不重複處理

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[ECPay Callback] received:", JSON.stringify(body));

    if (Number(body.TransCode) !== 1) {
      console.log("[ECPay Callback] TransCode !== 1, skip:", body.TransCode);
      return new Response("1|OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const data = aesDecrypt(body.Data) as Record<string, any>;
    console.log("[ECPay Callback] decrypted:", JSON.stringify(data));
    const rtnCode = Number(data.RtnCode);
    const merchantTradeNo = data.MerchantTradeNo as string;
    const tradeNo = data.TradeNo as string;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.merchantTradeNo, merchantTradeNo))
      .limit(1);

    console.log("[ECPay Callback] order found:", order?.id, "status:", order?.status, "rtnCode:", rtnCode);

    if (order && order.status !== "paid") {
      if (rtnCode === 1) {
        await db
          .update(orders)
          .set({
            status: "paid",
            ecpayTradeNo: tradeNo,
            paidAt: new Date(),
          })
          .where(eq(orders.id, order.id));
        console.log("[ECPay Callback] DB updated to paid, figureId:", order.figureId);
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
