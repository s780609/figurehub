import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createFigure } from "@/lib/actions";
import { getPreorderById } from "@/data/preorders";
import FigureForm from "@/components/FigureForm";
import Link from "next/link";

type Props = { searchParams: Promise<{ fromPreorder?: string }> };

export default async function NewFigurePage({ searchParams }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  // 從預購模型複製：預填名稱與價格
  const { fromPreorder } = await searchParams;
  const preorder = fromPreorder ? await getPreorderById(fromPreorder) : null;
  const initial =
    preorder && preorder.userId === userId
      ? { name: preorder.name, price: preorder.price }
      : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-base text-[var(--accent)] hover:underline"
      >
        &larr; 回到列表
      </Link>
      <h1 className="mb-6 text-xl font-bold">新增模型</h1>
      {initial && (
        <p className="mb-4 text-base text-[var(--foreground)]/60">
          已從預購模型帶入名稱與價格，請確認其餘欄位後新增。
        </p>
      )}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <FigureForm action={createFigure} initial={initial} />
      </div>
    </div>
  );
}
