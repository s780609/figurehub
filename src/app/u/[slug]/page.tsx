import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getFiguresBySlug, getUserBySlug } from "@/data/figures";
import FigureList from "@/components/FigureList";
import type { Metadata } from "next";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const user = await getUserBySlug(slug);
  if (!user) return { title: "找不到使用者" };

  return {
    title: `${user.name} 的模型收藏 - FigureHub`,
    description: `${user.name} 的二手模型收藏`,
  };
}

export default async function UserStorePage({ params }: Props) {
  const { slug } = await params;
  const user = await getUserBySlug(slug);
  if (!user) notFound();

  const figures = await getFiguresBySlug(slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          {user.avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatarUrl}
              alt=""
              className="h-10 w-10 rounded-full"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {user.name} 的模型收藏
          </h1>
        </div>
        <p className="mt-2 text-[var(--foreground)]/60">
          精選二手公仔與模型，拆擺品與全新未拆通通有
        </p>
      </section>

      <Suspense>
        <FigureList figures={figures} basePath={`/u/${slug}`} />
      </Suspense>
    </div>
  );
}
