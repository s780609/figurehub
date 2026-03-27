import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
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

// GET: 3D Secure OTP 完成後 302/303 redirect 回來（method 變 GET）
export async function GET(req: NextRequest) {
  const resultDataStr = req.nextUrl.searchParams.get("ResultData");
  return handleResult(resultDataStr);
}
}
