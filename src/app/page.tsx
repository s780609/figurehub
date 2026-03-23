import FigureCard from "@/components/FigureCard";
import { figures } from "@/data/figures";

export default function HomePage() {
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

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
        {figures.map((fig) => (
          <FigureCard key={fig.id} figure={fig} />
        ))}
      </div>
    </div>
  );
}
