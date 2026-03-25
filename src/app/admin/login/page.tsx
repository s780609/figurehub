import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "@/components/LoginButton";

export default async function LoginPage() {
  const session = await auth();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8">
        <h1 className="mb-3 text-center text-xl font-bold">
          <span className="text-[var(--accent)]">Figure</span>Hub 後台登入
        </h1>
        <p className="mb-6 text-center text-sm text-[var(--foreground)]/60 leading-relaxed">
          登入後可以記錄自己的模型管理和照片，<br />適合像我一樣買太多的同好
        </p>

        <LoginButton
          signInAction={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        />
      </div>
    </div>
  );
}
