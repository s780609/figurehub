import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { orders, figures } from "@/lib/schema";
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

    if (body.TransCode !== 1) {
      return new Response("1|OK", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    const data = aesDecrypt(body.Data) as Record<string, any>;
    // AES-JSON 解密後 RtnCode 為整數，用 Number() 做防禦性轉型
    const rtnCode = Number(data.RtnCode);
    const merchantTradeNo = data.MerchantTradeNo as string;
    const tradeNo = data.TradeNo as string;

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.merchantTradeNo, merchantTradeNo))
      .limit(1);

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
        await db
          .update(figures)
          .set({ soldStatus: "準備中" })
          .where(eq(figures.id, order.figureId));
      } else {
        await db
          .update(orders)
          .set({ status: "failed" })
          .where(eq(orders.id, order.id));
      }
    }
    // 已經是 paid → 冪等，不重複處理
  } catch {
    // 解密失敗等，仍回 1|OK 避免 ECPay 重試
  }

  return new Response("1|OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
