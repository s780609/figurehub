import { getSoldFigures } from "@/data/figures";
import HomeFigureList from "@/components/HomeFigureList";

export const revalidate = 60;

export default async function HomePage() {
  const { items, hasMore } = await getSoldFigures();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          二手模型資訊
        </h1>
        <p className="mt-2 text-[var(--foreground)]/60">
          二手公仔與模型的成交價格一覽
        </p>
      </section>

      <HomeFigureList initialItems={items} initialHasMore={hasMore} />
    </div>
  );
}
