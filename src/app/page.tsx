import Link from "next/link";
import { getSoldFigures } from "@/data/figures";

export const revalidate = 60;

export default async function HomePage() {
  const figures = await getSoldFigures();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          二手模型資訊
        </h1>
        <p className="mt-2 text-[var(--foreground)]/60">
          二手公仔與模型的成交價格一覽
        </p>
      </section>

      {figures.length === 0 ? (
        <p className="text-center text-[var(--foreground)]/50">目前還沒有成交紀錄</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)]">
          <table className="w-full text-left text-base">
            <thead className="border-b border-[var(--card-border)] text-sm text-[var(--foreground)]/60">
              <tr>
                <th className="px-4 py-3 font-medium">模型名稱</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">狀況</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">銷售方式</th>
                <th className="whitespace-nowrap px-4 py-3 text-right font-medium">成交價格</th>
                <th className="whitespace-nowrap px-4 py-3 font-medium">賣家</th>
              </tr>
            </thead>
            <tbody>
              {figures.map((fig) => (
                <tr
                  key={fig.id}
                  className="border-b border-[var(--card-border)] last:border-b-0"
                >
                  <td className="min-w-[200px] px-4 py-3">
                    <Link
                      href={`/u/${fig.sellerSlug}/figure/${fig.id}`}
                      className="font-medium hover:text-[var(--accent)] hover:underline"
                    >
                      {fig.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">{fig.condition}</td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                        fig.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
                      }`}
                    >
                      {fig.saleMethod}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-[var(--accent)]">
                    NT${(fig.dealPrice ?? fig.price).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <Link
                      href={`/u/${fig.sellerSlug}`}
                      className="text-[var(--accent)] hover:underline"
                    >
                      {fig.sellerName}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
