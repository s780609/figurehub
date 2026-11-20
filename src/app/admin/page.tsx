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
      {unclaimedCount > 0 && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <span className="text-sm">
            有 <strong>{unclaimedCount}</strong> 筆模型尚未綁定使用者
          </span>
          <form action={claimUnownedFigures}>
            <SubmitButton
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              pendingText="認領中..."
            >
              認領到我的帳號
            </SubmitButton>
          </form>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-baseline gap-2 text-xl font-bold">
          模型列表
          <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            {figures.length}
          </span>
        </h1>
        <Link
          href="/admin/figures/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增模型
        </Link>
      </div>

      {/* 統計卡片 */}
      <div className="mb-4 grid grid-cols-4 gap-3">
        <div className="rounded-lg bg-[var(--card-bg)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            總售出金額
          </p>
          <p className="text-xl font-bold text-[var(--accent)]">NT${totalSoldAmount.toLocaleString()}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">{figures.length} 筆模型</p>
        </div>
        <div className="rounded-lg bg-[var(--card-bg)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
            未售出
          </p>
          <p className="text-xl font-bold text-emerald-500">{unsoldFigures.length}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">等待買家</p>
        </div>
        <div className="rounded-lg bg-[var(--card-bg)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            準備中
          </p>
          <p className="text-xl font-bold text-amber-500">{preparingFigures.length}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">待出貨</p>
        </div>
        <div className="rounded-lg bg-[var(--card-bg)] p-3.5">
          <p className="mb-1 flex items-center gap-1.5 text-xs text-[var(--foreground)]/50">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            已售出
          </p>
          <p className="text-xl font-bold text-red-500">{soldFigures.length}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/40">已完成</p>
        </div>
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
