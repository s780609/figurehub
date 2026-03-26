import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllPreorders } from "@/data/preorders";
import { deletePreorder } from "@/lib/actions";
import Link from "next/link";
import AdminPreorderList from "@/components/AdminPreorderList";

export const dynamic = "force-dynamic";

async function deleteAction(id: string) {
  "use server";
  await deletePreorder(id);
}

export default async function PreordersPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const preorders = await getAllPreorders(userId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">預購模型管理</h1>
        <Link
          href="/admin/preorders/new"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-base font-medium tracking-wide text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          + 新增預購
        </Link>
      </div>

      <AdminPreorderList preorders={preorders} deleteAction={deleteAction} />
    </div>
  );
}
