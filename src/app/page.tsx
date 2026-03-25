import { Suspense } from "react";
import { getAllFiguresPublic } from "@/data/figures";
import FigureList from "@/components/FigureList";

export const revalidate = 60;

export default async function HomePage() {
  const figures = await getAllFiguresPublic();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          二手模型專賣
        </h1>
        <p className="mt-2 text-[var(--foreground)]/60">
          精選二手公仔與模型，拆擺品與全新未拆通通有
        </p>
      </section>

      <Suspense>
        <FigureList figures={figures} />
      </Suspense>
    </div>
  );
}
