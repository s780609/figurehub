export default function FigureDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
      {/* 返回 */}
      <div className="mb-6 h-4 w-20 rounded bg-[var(--card-border)]" />

      {/* 標題區 */}
      <div className="mb-6">
        <div className="h-8 w-3/4 rounded bg-[var(--card-border)]" />
        <div className="mt-3 flex gap-3">
          <div className="h-7 w-16 rounded-full bg-[var(--card-border)]" />
          <div className="h-7 w-20 rounded-full bg-[var(--card-border)]" />
          <div className="h-7 w-16 rounded-full bg-[var(--card-border)]" />
          <div className="h-7 w-24 rounded bg-[var(--card-border)]" />
        </div>
      </div>

      {/* 銷售方式 Bar */}
      <div className="mb-6 h-10 rounded-lg bg-[var(--card-border)]" />

      {/* 說明 */}
      <div className="mb-8 h-20 rounded-lg bg-[var(--card-border)]" />

      {/* 照片 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="aspect-square rounded-lg bg-[var(--card-border)]" />
        <div className="aspect-square rounded-lg bg-[var(--card-border)]" />
      </div>
    </div>
  );
}
