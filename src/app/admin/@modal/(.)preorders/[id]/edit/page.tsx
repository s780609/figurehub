import { getCurrentUserId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPreorderById } from "@/data/preorders";
import { updatePreorder } from "@/lib/actions";
import PreorderForm from "@/components/PreorderForm";
import Modal from "@/components/Modal";

type Props = { params: Promise<{ id: string }> };

export default async function EditPreorderModal({ params }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const { id } = await params;
  const preorder = await getPreorderById(id);
  if (!preorder) notFound();

  if (preorder.userId && preorder.userId !== userId) notFound();

  const updateWithId = updatePreorder.bind(null, id);

  return (
    <Modal title="編輯預購模型">
      <PreorderForm action={updateWithId} preorder={preorder} />
    </Modal>
  );
}
