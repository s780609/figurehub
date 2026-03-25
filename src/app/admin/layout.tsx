import { auth } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {session && (
        <>
          <h1 className="mb-2 text-xl font-bold">模型管理</h1>
          <div className="mb-6 flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-3">
            <a
              href="/admin"
              className="text-sm hover:text-[var(--accent)] transition-colors"
            >
              模型列表
            </a>
            <a
              href="/admin/generate"
              className="text-sm hover:text-[var(--accent)] transition-colors"
            >
              產生文章
            </a>
          </div>
        </>
      )}
      {children}
    </div>
  );
}
