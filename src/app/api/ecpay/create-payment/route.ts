import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { callCreatePayment } from "@/lib/ecpay";

// 來源：SNAPSHOT 2026-03 | guides/02a-ecpg-quickstart.md 步驟 4

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_CREDIT_CARD !== "true") {
    return NextResponse.json({ error: "信用卡付款功能目前未開放" }, { status: 403 });
  }

  const body = await req.json();
  const payToken = body.payToken as string | undefined;
  const merchantTradeNo = body.merchantTradeNo as string | undefined;

  if (!payToken || !merchantTradeNo) {
    return NextResponse.json({ error: "缺少必填欄位" }, { status: 400 });
  }

  // 確認訂單存在且為 pending
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.merchantTradeNo, merchantTradeNo))
    .limit(1);

  if (!order || order.status !== "pending") {
    return NextResponse.json(
      { error: "訂單不存在或已處理" },
      { status: 400 }
    );
  }

  try {
    const result = await callCreatePayment({ payToken, merchantTradeNo });

    if (result.threeDUrl) {
      return NextResponse.json({ threeDUrl: result.threeDUrl });
    }
    if (result.success) {
      // 不需 3D 驗證，直接成功（少見）
      await db
        .update(orders)
        .set({
          status: "paid",
          ecpayTradeNo: result.tradeNo,
          paidAt: new Date(),
        })
        .where(eq(orders.id, order.id));
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: result.errorMsg }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "未知錯誤";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
