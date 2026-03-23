import FigureCard from "@/components/FigureCard";
import { getAllFigures } from "@/data/figures";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const figures = await getAllFigures();

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

      {figures.length === 0 ? (
        <p className="text-center text-[var(--foreground)]/40">
          目前沒有上架的模型，請稍後再來看看
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
          {figures.map((fig) => (
            <FigureCard key={fig.id} figure={fig} />
          ))}
        </div>
      )}
    </div>
  );
}
