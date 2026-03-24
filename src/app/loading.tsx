export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
      <div className="mb-8 text-center">
        <div className="mx-auto h-9 w-48 rounded bg-[var(--card-border)]" />
        <div className="mx-auto mt-2 h-4 w-64 rounded bg-[var(--card-border)]" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-[var(--card-border)]"
          >
            <div className="aspect-square bg-[var(--card-border)]" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-[var(--card-border)]" />
              <div className="flex gap-1.5">
                <div className="h-5 w-12 rounded-full bg-[var(--card-border)]" />
                <div className="h-5 w-16 rounded-full bg-[var(--card-border)]" />
              </div>
              <div className="h-6 w-20 rounded bg-[var(--card-border)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
