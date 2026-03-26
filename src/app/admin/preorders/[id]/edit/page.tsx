import { getCurrentUserId } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPreorderById } from "@/data/preorders";
import { updatePreorder } from "@/lib/actions";
import PreorderForm from "@/components/PreorderForm";
import Link from "next/link";

type Props = { params: Promise<{ id: string }> };

export default async function EditPreorderPage({ params }: Props) {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const { id } = await params;
  const preorder = await getPreorderById(id);
  if (!preorder) notFound();

  if (preorder.userId && preorder.userId !== userId) notFound();

  const updateWithId = updatePreorder.bind(null, id);

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/preorders"
        className="mb-4 inline-flex items-center gap-1 text-base text-[var(--accent)] hover:underline"
      >
        &larr; 回到列表
      </Link>
      <h1 className="mb-6 text-xl font-bold">編輯預購模型</h1>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6">
        <PreorderForm action={updateWithId} preorder={preorder} />
      </div>
    </div>
  );
}
