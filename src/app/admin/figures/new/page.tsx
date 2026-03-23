import { verifyAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createFigure } from "@/lib/actions";
import FigureForm from "@/components/FigureForm";

export default async function NewFigurePage() {
  if (!(await verifyAuth())) redirect("/admin/login");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-xl font-bold">新增模型</h1>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <FigureForm action={createFigure} />
      </div>
    </div>
  );
}
