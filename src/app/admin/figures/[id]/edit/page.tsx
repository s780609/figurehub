import { verifyAuth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFigureById } from "@/data/figures";
import { updateFigure } from "@/lib/actions";
import FigureForm from "@/components/FigureForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditFigurePage({ params }: Props) {
  if (!(await verifyAuth())) redirect("/admin/login");

  const { id } = await params;
  const figure = await getFigureById(id);
  if (!figure) notFound();

  const updateWithId = updateFigure.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">編輯模型</h1>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <FigureForm action={updateWithId} figure={figure} />
      </div>
    </div>
  );
}
