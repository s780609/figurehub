import Link from "next/link";
import { getAllSellers } from "@/data/figures";

export const revalidate = 60;

export default async function HomePage() {
  const sellers = await getAllSellers();

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

      {sellers.length === 0 ? (
        <p className="text-center text-[var(--foreground)]/50">目前還沒有賣場</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sellers.map((seller) => (
            <Link
              key={seller.id}
              href={`/u/${seller.slug}`}
              className="flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-5 transition-shadow hover:shadow-lg"
            >
              {seller.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.avatarUrl}
                  alt=""
                  className="h-14 w-14 rounded-full"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent)] text-xl font-bold text-white">
                  {seller.name[0]}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold">{seller.name}</h2>
                <p className="text-sm text-[var(--foreground)]/60">
                  {seller.figureCount} 件模型
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
