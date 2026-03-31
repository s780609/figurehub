import * as crypto from "crypto";

// ---------- Config ----------
// AIO 使用 CMV-SHA256，走 payment domain
// 查詢交易走 ecpayment domain（AES-JSON）

function getConfig() {
  const merchantId = process.env.ECPAY_MERCHANT_ID!;
  const hashKey = process.env.ECPAY_HASH_KEY!;
  const hashIv = process.env.ECPAY_HASH_IV!;
  const isStage = process.env.ECPAY_ENV !== "prod";
  const aioDomain = isStage
    ? "https://payment-stage.ecpay.com.tw"
    : "https://payment.ecpay.com.tw";
  const ecpaymentDomain = isStage
    ? "https://ecpayment-stage.ecpay.com.tw"
    : "https://ecpayment.ecpay.com.tw";
  return { merchantId, hashKey, hashIv, isStage, aioDomain, ecpaymentDomain };
}

// ---------- AES-128-CBC（queryTrade 用）----------

/**
 * aesUrlEncode（AES 專用）：encodeURIComponent + 特殊字元替換
 * ⚠️ 絕不混用 ecpayUrlEncode（CMV 用，多 toLowerCase + .NET 替換）
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
  const cipher = crypto.createCipheriv(
    "aes-128-cbc",
    Buffer.from(hashKey),
    Buffer.from(hashIv)
  );
  return Buffer.concat([
    cipher.update(encoded, "utf8"),
    cipher.final(),
  ]).toString("base64");
}

export function aesDecrypt(base64Str: string): Record<string, unknown> {
  const { hashKey, hashIv } = getConfig();
  const decipher = crypto.createDecipheriv(
    "aes-128-cbc",
    Buffer.from(hashKey),
    Buffer.from(hashIv)
  );
  const raw = Buffer.concat([
    decipher.update(base64Str, "base64"),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(decodeURIComponent(raw.replace(/\+/g, "%20")));
}

// ---------- CheckMacValue（AIO 金流用，CMV-SHA256）----------
// 來源：guides/13-checkmacvalue.md Node.js 實作

/**
 * ecpayUrlEncode（CMV 專用）：encodeURIComponent → 轉小寫 → .NET 字元替換
 * ⚠️ 不可與 aesUrlEncode 混用
 */
function ecpayUrlEncode(source: string): string {
  let encoded = encodeURIComponent(source)
    .replace(/%20/g, "+")
    .replace(/~/g, "%7e")
    .replace(/'/g, "%27");
  encoded = encoded.toLowerCase();
  const replacements: Record<string, string> = {
    "%2d": "-",
    "%5f": "_",
    "%2e": ".",
    "%21": "!",
    "%2a": "*",
    "%28": "(",
    "%29": ")",
  };
  for (const [old, char] of Object.entries(replacements)) {
    encoded = encoded.split(old).join(char);
  }
  return encoded;
}

export function generateCheckMacValue(
  params: Record<string, string | number>
): string {
  const { hashKey, hashIv } = getConfig();

  // 1. 移除既有 CheckMacValue
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([k]) => k !== "CheckMacValue")
  );
  // 2. Key 不區分大小寫排序
  const sorted = Object.keys(filtered).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );
  // 3. 組合字串
  const paramStr = sorted.map((k) => `${k}=${filtered[k]}`).join("&");
  const raw = `HashKey=${hashKey}&${paramStr}&HashIV=${hashIv}`;
  // 4. ECPay URL encode
  const encoded = ecpayUrlEncode(raw);
  // 5. SHA256
  const hash = crypto.createHash("sha256").update(encoded, "utf8").digest("hex");
  // 6. 轉大寫
  return hash.toUpperCase();
}

export function verifyCheckMacValue(
  params: Record<string, string>
): boolean {
  const received = params.CheckMacValue || "";
  const calculated = generateCheckMacValue(params);
  const a = Buffer.from(received.toUpperCase());
  const b = Buffer.from(calculated);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
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

// ---------- AIO 表單參數產生 ----------

export function generateAioParams(opts: {
  merchantTradeNo: string;
  totalAmount: number;
  itemName: string;
  returnUrl: string;
  orderResultUrl: string;
}): { params: Record<string, string | number>; actionUrl: string } {
  const { merchantId, aioDomain } = getConfig();

  const params: Record<string, string | number> = {
    MerchantID: merchantId,
    MerchantTradeNo: opts.merchantTradeNo,
    MerchantTradeDate: formatTradeDate(),
    PaymentType: "aio",
    TotalAmount: opts.totalAmount,
    TradeDesc: "FigureHub 購買模型",
    ItemName: opts.itemName.slice(0, 200),
    ReturnURL: opts.returnUrl,
    OrderResultURL: opts.orderResultUrl,
    ChoosePayment: "Credit",
    EncryptType: 1,
  };

  params.CheckMacValue = generateCheckMacValue(params);

  return {
    params,
    actionUrl: `${aioDomain}/Cashier/AioCheckOut/V5`,
  };
}

// ---------- 查詢交易（AES-JSON，走 ecpayment domain）----------

export async function queryTrade(merchantTradeNo: string): Promise<{
  paid: boolean;
  tradeNo?: string;
  errorMsg?: string;
}> {
  const { merchantId, ecpaymentDomain } = getConfig();

  const body = {
    MerchantID: merchantId,
    RqHeader: { Timestamp: Math.floor(Date.now() / 1000) },
    Data: aesEncrypt({
      PlatformID: "",
      MerchantID: merchantId,
      MerchantTradeNo: merchantTradeNo,
    }),
  };

  const res = await fetch(
    `${ecpaymentDomain}/1.0.0/Cashier/QueryTrade`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const json = await res.json();

  if (Number(json.TransCode) !== 1) {
    return { paid: false, errorMsg: `AES 層: ${json.TransMsg}` };
  }
  const data = aesDecrypt(json.Data) as Record<string, any>;
  if (Number(data.RtnCode) === 1 && data.TradeStatus === "1") {
    return { paid: true, tradeNo: data.TradeNo as string };
  }
  return { paid: false };
}
