import { getCurrentUserId } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUnsoldFigures } from "@/data/figures";
import ArticleGenerator from "@/components/ArticleGenerator";

export const dynamic = "force-dynamic";

export default async function GeneratePage() {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/admin/login");

  const figures = await getUnsoldFigures(userId);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">產生刊登文章</h1>
      <ArticleGenerator figures={figures} />
    </div>
  );
}
