"use client";

import { useState, useRef, useEffect } from "react";

const groups = [
  {
    name: "PVC、黏土人 2手玩具的新家（徵收附上預算）",
    url: "https://www.facebook.com/groups/1578004059144129?locale=zh_TW",
  },
];

export default function GroupDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
      >
        聯絡資訊
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-[var(--card-border)] bg-[var(--background)] shadow-lg">
          {/* LINE ID */}
          <div className="flex items-center gap-2 px-4 py-3 text-sm border-b border-[var(--card-border)]">
            <svg className="h-4 w-4 shrink-0 text-[#06C755]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.365 9.864c.018 0 .049 0 .018 0C21.101 6.748 24 4.087 24 1.908 24 .855 23.168 0 22.13 0H1.87C.832 0 0 .855 0 1.908c0 2.18 2.899 4.84 4.617 7.956.018.018 0 0 .018 0C1.721 13.076 0 16.578 0 18.092 0 19.145.832 20 1.87 20h20.26c1.038 0 1.87-.855 1.87-1.908 0-1.514-1.721-5.016-4.635-8.228z" />
            </svg>
            <span>LINE ID：<span className="font-medium select-all">huanhuan0506</span></span>
          </div>
          {/* 常用PVC社團 */}
          <div className="px-4 py-2 text-xs text-[var(--foreground)]/40 font-medium">常用PVC社團</div>
          {groups.map((g) => (
            <a
              key={g.url}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-[var(--accent)]/10 transition-colors last:rounded-b-lg"
            >
              <svg className="h-4 w-4 shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {g.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
