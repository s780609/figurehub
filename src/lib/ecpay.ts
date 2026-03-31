import * as crypto from "crypto";

// ---------- Config ----------
// 來源：SNAPSHOT 2026-03 | guides/02a-ecpg-quickstart.md + guides/14-aes-encryption.md

function getConfig() {
  const merchantId = process.env.ECPAY_MERCHANT_ID!;
  const hashKey = Buffer.from(process.env.ECPAY_HASH_KEY!);
  const hashIv = Buffer.from(process.env.ECPAY_HASH_IV!);
  const isStage = process.env.ECPAY_ENV !== "prod";
  const ecpgDomain = isStage
    ? "https://ecpg-stage.ecpay.com.tw"
    : "https://ecpg.ecpay.com.tw";
  return { merchantId, hashKey, hashIv, isStage, ecpgDomain };
}

// ---------- AES-128-CBC ----------

/**
 * aesUrlEncode（AES 專用）：encodeURIComponent + 特殊字元替換
 * ⚠️ 絕不混用 ecpayUrlEncode（CMV 用，多 toLowerCase + .NET 替換）
 * 來源：guides/14-aes-encryption.md Node.js 實作
 */
function aesUrlEncode(source: string): string {
  return encodeURIComponent(source)
    .replace(/%20/g, "+")
    .replace(/~/g, "%7E")
    .replace(/!/g, "%21")
    .replace(/'/g, "%27")
    .replace(/\(/g, "%28")
    .replace(/\)/g, "%29")
    .replace(/\*/g, "%2A");
}

export function aesEncrypt(data: object): string {
  const { hashKey, hashIv } = getConfig();
  const json = JSON.stringify(data);
  const encoded = aesUrlEncode(json);
  const cipher = crypto.createCipheriv("aes-128-cbc", hashKey, hashIv);
  // 標準 Base64 alphabet（+, /, =），禁止 URL-safe
  return Buffer.concat([
    cipher.update(encoded, "utf8"),
    cipher.final(),
  ]).toString("base64");
}

export function aesDecrypt(base64Str: string): Record<string, unknown> {
  const { hashKey, hashIv } = getConfig();
  const decipher = crypto.createDecipheriv("aes-128-cbc", hashKey, hashIv);
  const raw = Buffer.concat([
    decipher.update(base64Str, "base64"),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(decodeURIComponent(raw.replace(/\+/g, "%20")));
}

// ---------- Helpers ----------

/** 產生 ≤20 字元英數字訂單編號（含時間戳保證唯一） */
export function generateMerchantTradeNo(): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(3).toString("hex");
  return `FH${ts}${rand}`.slice(0, 20).toUpperCase();
}

/** UTC+8 格式 yyyy/MM/dd HH:mm:ss（MerchantTradeDate 必須使用台灣時間） */
export function formatTradeDate(): string {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Taipei" })
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}/${pad(now.getMonth() + 1)}/${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

// ---------- API Calls ----------

export async function getTokenByTrade(opts: {
  merchantTradeNo: string;
  totalAmount: number;
  itemName: string;
  buyerEmail: string;
  returnUrl: string;
  orderResultUrl: string;
}): Promise<{ token: string }> {
  const { merchantId, ecpgDomain } = getConfig();

  const body = {
    MerchantID: merchantId,
    RqHeader: { Timestamp: Math.floor(Date.now() / 1000) },
    Data: aesEncrypt({
      MerchantID: merchantId, // Data 內也要（兩處都必填）
      RememberCard: 0,
      PaymentUIType: 2,
      ChoosePaymentList: "1", // 信用卡
      OrderInfo: {
        MerchantTradeDate: formatTradeDate(),
        MerchantTradeNo: opts.merchantTradeNo,
        TotalAmount: opts.totalAmount,
        ReturnURL: opts.returnUrl,
        TradeDesc: "FigureHub 購買模型",
        ItemName: opts.itemName.slice(0, 200),
      },
      CardInfo: {
        OrderResultURL: opts.orderResultUrl,
      },
      ConsumerInfo: {
        Email: opts.buyerEmail,
      },
    }),
  };

  const res = await fetch(`${ecpgDomain}/Merchant/GetTokenbyTrade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();

  // 雙層檢查：先 TransCode（AES 傳輸層），再 RtnCode（業務層）
  if (Number(json.TransCode) !== 1) {
    throw new Error(`ECPay AES 層失敗: ${json.TransMsg}`);
  }
  const decoded = aesDecrypt(json.Data);
  if (Number(decoded.RtnCode) !== 1) {
    throw new Error(`ECPay 業務層失敗: ${decoded.RtnMsg}`);
  }
  return { token: decoded.Token as string };
}

export async function callCreatePayment(opts: {
  payToken: string;
  merchantTradeNo: string;
}): Promise<{
  threeDUrl?: string;
  success?: boolean;
  tradeNo?: string;
  errorMsg?: string;
}> {
  const { merchantId, ecpgDomain } = getConfig();

  const body = {
    MerchantID: merchantId,
    RqHeader: { Timestamp: Math.floor(Date.now() / 1000) },
    Data: aesEncrypt({
      MerchantID: merchantId,
      PayToken: opts.payToken,
      MerchantTradeNo: opts.merchantTradeNo,
    }),
  };

  const res = await fetch(`${ecpgDomain}/Merchant/CreatePayment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();

  if (Number(json.TransCode) !== 1) {
    return { errorMsg: `AES 層: ${json.TransMsg}` };
  }
  const data = aesDecrypt(json.Data) as Record<string, any>;

  // 2025/8 後幾乎必定進入 3D 驗證
  const threeDUrl = data.ThreeDInfo?.ThreeDURL ?? "";
  if (threeDUrl) {
    return { threeDUrl };
  }
  if (Number(data.RtnCode) === 1) {
    return { success: true, tradeNo: data.OrderInfo?.TradeNo };
  }
  return { errorMsg: data.RtnMsg as string };
}
