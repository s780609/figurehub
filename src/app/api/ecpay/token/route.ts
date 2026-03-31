import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { figures, orders, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { generateMerchantTradeNo, getTokenByTrade } from "@/lib/ecpay";

const ALLOWED_SELLER_SLUG = process.env.ECPAY_SELLER_SLUG;

// 來源：SNAPSHOT 2026-03 | guides/02a-ecpg-quickstart.md 步驟 1

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_ENABLE_CREDIT_CARD !== "true") {
    return NextResponse.json({ error: "信用卡付款功能目前未開放" }, { status: 403 });
  }

  const body = await req.json();
  const figureId = body.figureId as string | undefined;
  const buyerEmail = body.buyerEmail as string | undefined;

  if (!figureId || !buyerEmail) {
    return NextResponse.json({ error: "缺少必填欄位" }, { status: 400 });
  }

  // 查詢商品
  const [figure] = await db
    .select()
    .from(figures)
    .where(eq(figures.id, figureId))
    .limit(1);

  if (!figure) {
    return NextResponse.json({ error: "商品不存在" }, { status: 404 });
  }
  if (figure.soldStatus !== "未售出") {
    return NextResponse.json({ error: "商品已售出" }, { status: 400 });
  }

  // 信用卡功能僅開放給特定賣家
  if (figure.userId) {
    const [seller] = await db
      .select({ slug: users.slug })
      .from(users)
      .where(eq(users.id, figure.userId))
      .limit(1);
    if (!seller || seller.slug !== ALLOWED_SELLER_SLUG) {
      return NextResponse.json({ error: "此賣家未開放信用卡付款" }, { status: 403 });
    }
  } else {
    return NextResponse.json({ error: "此商品未開放信用卡付款" }, { status: 403 });
  }

  const merchantTradeNo = generateMerchantTradeNo();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://figurehub.xyz";

  try {
    // 建立 pending 訂單
    await db.insert(orders).values({
      figureId,
      merchantTradeNo,
      amount: figure.price,
      buyerEmail,
      status: "pending",
    });

    // 呼叫 ECPay GetTokenbyTrade
    // OrderResultURL 帶 mtn 參數，3D Secure 302 redirect 後 GET 不帶 ResultData
    const { token } = await getTokenByTrade({
      merchantTradeNo,
      totalAmount: figure.price,
      itemName: figure.name,
      buyerEmail,
      returnUrl: `${siteUrl}/api/ecpay/callback`,
      orderResultUrl: `${siteUrl}/api/ecpay/result?mtn=${merchantTradeNo}`,
    });

    return NextResponse.json({ token, merchantTradeNo });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "未知錯誤";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
