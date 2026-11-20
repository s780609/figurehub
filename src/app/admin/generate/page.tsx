import { getCurrentUserId, getCurrentUserSlug } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUnsoldFigures } from "@/data/figures";
import ArticleGenerator from "@/components/ArticleGenerator";

export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const slug = await getCurrentUserSlug();
  const figures = await getUnsoldFigures(userId);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="flex items-baseline gap-2 text-xl font-bold">
          刊登文章
          <span className="rounded-full bg-[var(--accent)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]">
            {figures.length} 件可刊登
          </span>
        </h1>
      </div>
      <ArticleGenerator figures={figures} slug={slug ?? ""} />
    </div>
  );
}
