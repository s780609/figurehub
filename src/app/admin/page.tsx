import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFigures, getUnclaimedFiguresCount } from "@/data/figures";
import {
  deleteFigure,
  claimUnownedFigures,
  cycleFigureSaleMethod,
  cycleFigureSoldStatus,
} from "@/lib/actions";
import Link from "next/link";
import AdminFigureList from "@/components/AdminFigureList";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

async function deleteAction(id: string) {
  "use server";
  await deleteFigure(id);
}

export default async function AdminDashboard() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const figures = await getAllFigures(userId);
  const unclaimedCount = await getUnclaimedFiguresCount();

  const soldFigures = figures.filter((f) => f.soldStatus === "已售出");
  const preparingFigures = figures.filter((f) => f.soldStatus === "準備中");
  const unsoldFigures = figures.filter((f) => f.soldStatus === "未售出");
  const totalSoldAmount = soldFigures.reduce(
    (sum, f) => sum + (f.dealPrice ?? f.price),
    0,
  );

  return (
    <div>
      <div className="mb-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <div className="text-base text-[var(--foreground)]/60">總售出金額</div>
            <div className="text-2xl font-bold text-[var(--accent)]">
              NT${totalSoldAmount.toLocaleString()}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-base">
            <span className="text-[var(--foreground)]/60">
              已售出{" "}
              <span className="font-semibold text-red-600">{soldFigures.length}</span>
            </span>
            <span className="text-[var(--foreground)]/60">
              準備中{" "}
              <span className="font-semibold text-yellow-500">{preparingFigures.length}</span>
            </span>
            <span className="text-[var(--foreground)]/60">
              未售出{" "}
              <span className="font-semibold text-emerald-600">{unsoldFigures.length}</span>
            </span>
          </div>
        </div>
      </div>

      {unclaimedCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <span className="text-base">
            有 <strong>{unclaimedCount}</strong> 筆模型尚未綁定使用者
          </span>
          <form action={claimUnownedFigures}>
            <SubmitButton
              className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-1.5 text-base font-medium text-white hover:bg-yellow-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              pendingText="認領中..."
            >
              認領到我的帳號
            </SubmitButton>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">模型列表</h1>
        <Link
          href="/admin/figures/new"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-base font-medium tracking-wide text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + 新增模型
        </Link>
      </div>

      <AdminFigureList
        figures={figures}
        deleteAction={deleteAction}
        cycleSaleMethodAction={cycleFigureSaleMethod}
        cycleSoldStatusAction={cycleFigureSoldStatus}
      />
    </div>
  );
}
