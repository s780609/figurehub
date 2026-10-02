/** 今天的日期（台灣時間），格式 YYYY-MM-DD */
function todayInTaipei(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
}

/**
 * 標記為已售出但未填成交日期時的預設值（YYYY-MM-DD）。
 * 競標：由結標時間推算，例 "2026/03/25 (週三) 晚上 22:00:00" → "2026-03-25"
 * 出售（或結標時間無法辨識）：今天
 */
export function defaultDealDate(saleMethod: string, bidEndTime?: string | null): string {
  if (saleMethod === "競標") {
    const m = bidEndTime?.match(/(\d{4})\/(\d{2})\/(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  }
  return todayInTaipei();
}
