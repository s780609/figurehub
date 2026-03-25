import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createFigure } from "@/lib/actions";
import FigureForm from "@/components/FigureForm";
import Link from "next/link";

export default async function NewFigurePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
      >
        &larr; 回到列表
      </Link>
      <h1 className="mb-6 text-xl font-bold">新增模型</h1>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <FigureForm action={createFigure} />
      </div>
    </div>
  );
}
