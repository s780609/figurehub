import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllFigures, getUnclaimedFiguresCount } from "@/data/figures";
import { deleteFigure, claimUnownedFigures } from "@/lib/actions";
import Link from "next/link";
import AdminFigureList from "@/components/AdminFigureList";

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

  return (
    <div>
      {unclaimedCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
          <span className="text-sm">
            有 <strong>{unclaimedCount}</strong> 筆模型尚未綁定使用者
          </span>
          <form action={claimUnownedFigures}>
            <button
              type="submit"
              className="rounded-lg bg-yellow-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-yellow-600 transition-colors"
            >
              認領到我的帳號
            </button>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">模型管理</h1>
        <Link
          href="/admin/figures/new"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-base font-medium tracking-wide text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + 新增模型
        </Link>
      </div>

      <AdminFigureList figures={figures} deleteAction={deleteAction} />
    </div>
  );
}
