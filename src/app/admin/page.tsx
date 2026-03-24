import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFigures } from "@/data/figures";
import { deleteFigure } from "@/lib/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  if (!(await verifyAuth())) redirect("/admin/login");

  const figures = await getAllFigures();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">模型管理</h1>
        <Link
          href="/admin/figures/new"
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + 新增模型
        </Link>
      </div>

      {figures.length === 0 ? (
        <p className="text-center text-[var(--foreground)]/40 py-12">
          尚無模型資料
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="border-b border-[var(--card-border)] bg-[var(--card-bg)]">
              <tr>
                <th className="px-4 py-3 font-medium">名稱</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">狀態</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">盒況</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">價格</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">交易方式</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">銷售方式</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">狀態</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">操作</th>
              </tr>
            </thead>
            <tbody>
              {figures.map((fig) => (
                <tr
                  key={fig.id}
                  className="border-b border-[var(--card-border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium">{fig.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                        fig.condition === "全新未拆"
                          ? "bg-[var(--tag-new)]"
                          : "bg-[var(--tag-opened)]"
                      }`}
                    >
                      {fig.condition}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fig.boxCondition}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    NT${fig.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{fig.shippingMethod}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                        fig.saleMethod === "競標" ? "bg-orange-500" : "bg-indigo-600"
                      }`}
                    >
                      {fig.saleMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium text-white ${
                        fig.soldStatus === "已售出"
                          ? "bg-red-600"
                          : fig.soldStatus === "準備中"
                            ? "bg-yellow-500"
                            : "bg-emerald-600"
                      }`}
                    >
                      {fig.soldStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/figures/${fig.id}/edit`}
                        className="rounded border border-[var(--accent)] px-2 py-1 text-xs text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white transition-colors"
                      >
                        編輯
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteFigure(fig.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded border border-red-500 px-2 py-1 text-xs text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          刪除
                        </button>
                      </form>
                    </div>
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
