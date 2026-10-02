import { getCurrentUserId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFigureById } from "@/data/figures";
import { updateFigure } from "@/lib/actions";
import FigureForm from "@/components/FigureForm";
import Modal from "@/components/Modal";

type Props = { params: Promise<{ id: string }> };

export default async function EditFigureModal({ params }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const { id } = await params;
  const figure = await getFigureById(id);
  if (!figure) notFound();

  // 確認此模型屬於目前使用者（或尚未認領）
  if (figure.userId && figure.userId !== userId) notFound();

  const updateWithId = updateFigure.bind(null, id);

  return (
    <Modal title="編輯模型">
      <FigureForm action={updateWithId} figure={figure} />
    </Modal>
  );
}
