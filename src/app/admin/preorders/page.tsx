import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllPreorders } from "@/data/preorders";
import { deletePreorder, togglePreorderArrived } from "@/lib/actions";
import Link from "next/link";
import AdminPreorderList from "@/components/AdminPreorderList";

export const dynamic = "force-dynamic";

async function deleteAction(id: string) {
  "use server";
  await deletePreorder(id);
}

async function toggleArrivedAction(id: string) {
  "use server";
  await togglePreorderArrived(id);
}

export default async function PreordersPage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const preorders = await getAllPreorders(userId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-baseline gap-2 text-xl font-bold">
          預購管理
          <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            {preorders.length}
          </span>
        </h1>
        <Link
          href="/admin/preorders/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-medium text-white hover:bg-[var(--accent-hover)] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新增預購
        </Link>
      </div>

      <AdminPreorderList preorders={preorders} deleteAction={deleteAction} toggleArrivedAction={toggleArrivedAction} />
    </div>
  );
}
