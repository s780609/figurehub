import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { aesDecrypt } from "@/lib/ecpay";

// 來源：SNAPSHOT 2026-03 | guides/02a-ecpg-quickstart.md 步驟 5
//
// OrderResultURL — 消費者瀏覽器 Form POST 跳轉
// Content-Type: application/x-www-form-urlencoded
// 讀取 ResultData → JSON parse 外層 → 解密 Data → redirect 回商品頁

export async function POST(req: NextRequest) {
  let figureId = "";
  let paymentStatus = "failed";

  try {
    const formData = await req.formData();
    const resultDataStr = formData.get("ResultData") as string;

    if (resultDataStr) {
      const outer = JSON.parse(resultDataStr);

      if (outer.TransCode === 1 && outer.Data) {
        const data = aesDecrypt(outer.Data) as Record<string, any>;
        const merchantTradeNo = data.MerchantTradeNo as string;

        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.merchantTradeNo, merchantTradeNo))
          .limit(1);

        if (order) {
          figureId = order.figureId;
          if (Number(data.RtnCode) === 1 || order.status === "paid") {
            paymentStatus = "success";
          }
        }
      }
    }
  } catch {
    // 解析失敗，fallback 到首頁
  }

  if (figureId) {
    redirect(`/figure/${figureId}?payment=${paymentStatus}`);
  }
  redirect(`/?payment=${paymentStatus}`);
}
