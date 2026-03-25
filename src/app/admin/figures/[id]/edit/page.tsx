import { getCurrentUserId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFigureById } from "@/data/figures";
import { updateFigure } from "@/lib/actions";
import FigureForm from "@/components/FigureForm";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function EditFigurePage({ params }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const { id } = await params;
  const figure = await getFigureById(id);
  if (!figure) notFound();

  // 確認此模型屬於目前使用者（或尚未認領）
  if (figure.userId && figure.userId !== userId) notFound();

  const updateWithId = updateFigure.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin"
        className="mb-4 inline-flex items-center gap-1 text-base text-[var(--accent)] hover:underline"
      >
        &larr; 回到列表
      </Link>
      <h1 className="mb-6 text-xl font-bold">編輯模型</h1>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <FigureForm action={updateWithId} figure={figure} />
      </div>
    </div>
  );
}
