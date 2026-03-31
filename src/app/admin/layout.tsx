import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

const ALLOWED_ORDER_EMAIL = process.env.ADMIN_EMAIL;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;
  let showOrders = false;
  if (userId) {
    const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
    showOrders = user?.email === ALLOWED_ORDER_EMAIL;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {session && (
        <>
          <h1 className="mb-2 text-xl font-bold">模型管理</h1>
          <div className="mb-6 flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-2">
            <a
              href="/admin"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-base font-medium text-white hover:opacity-80 transition-colors"
            >
              模型列表
            </a>
            <a
              href="/admin/preorders"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-base font-medium text-white hover:opacity-80 transition-colors"
            >
              預購模型
            </a>
            {showOrders && (
              <a
                href="/admin/orders"
                className="rounded-lg bg-[var(--accent)] px-4 py-2 text-base font-medium text-white hover:opacity-80 transition-colors"
              >
                訂單管理
              </a>
            )}
            <a
              href="/admin/generate"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-base font-medium text-white hover:opacity-80 transition-colors"
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
