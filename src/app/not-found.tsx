import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="mt-2 text-[var(--foreground)]/60">找不到這個模型</p>
      <Link
        href="/"
        className="mt-4 rounded-lg bg-[var(--accent)] px-4 py-2 text-base font-medium text-white hover:bg-[var(--accent-hover)]"
      >
        回到首頁
      </Link>
    </div>
  );
}
