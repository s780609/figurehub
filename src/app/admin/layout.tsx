import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { logoutAction } from "@/lib/actions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // login 頁面不需要驗證
  // layout 會在所有子路由生效，但 login 頁面自行處理
  const isAuthed = await verifyAuth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {isAuthed && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-[var(--accent)]">
              後台管理
            </span>
            <a
              href="/admin"
              className="text-sm hover:text-[var(--accent)] transition-colors"
            >
              模型列表
            </a>
            <a
              href="/admin/figures/new"
              className="text-sm hover:text-[var(--accent)] transition-colors"
            >
              新增模型
            </a>
            <a
              href="/admin/generate"
              className="text-sm hover:text-[var(--accent)] transition-colors"
            >
              產生文章
            </a>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-[var(--card-border)] px-3 py-1 text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors"
            >
              登出
            </button>
          </form>
        </div>
      )}
      {children}
    </div>
  );
}
