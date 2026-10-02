"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** 攔截路由用的大型彈窗：關閉時回到上一頁（列表） */
export default function Modal({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) router.back();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[var(--card-border)] px-6 py-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="關閉"
            className="rounded px-2 py-1 text-xl leading-none text-[var(--foreground)]/60 hover:text-[var(--foreground)] transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
