import { loginAction } from "@/lib/actions";
import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await verifyAuth()) redirect("/admin");
  const { error } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8">
        <h1 className="mb-6 text-center text-xl font-bold">
          <span className="text-[var(--accent)]">Figure</span>Hub 後台登入
        </h1>

        {error && (
          <p className="mb-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500">
            帳號或密碼錯誤
          </p>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium">
              帳號
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
          >
            登入
          </button>
        </form>
      </div>
    </div>
  );
}
