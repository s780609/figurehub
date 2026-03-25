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
        className="flex items-center gap-1 text-base text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
      >
        開發者聯絡資訊
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
        <div className="fixed right-4 left-4 sm:absolute sm:left-auto sm:right-0 mt-2 sm:w-80 rounded-lg border border-[var(--card-border)] bg-[var(--background)] shadow-lg">
          {/* LINE ID */}
          <div className="flex items-center gap-2 px-4 py-3 text-base border-b border-[var(--card-border)]">
            <svg className="h-4 w-4 shrink-0 text-[#06C755]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.365 9.864c.018 0 .049 0 .018 0C21.101 6.748 24 4.087 24 1.908 24 .855 23.168 0 22.13 0H1.87C.832 0 0 .855 0 1.908c0 2.18 2.899 4.84 4.617 7.956.018.018 0 0 .018 0C1.721 13.076 0 16.578 0 18.092 0 19.145.832 20 1.87 20h20.26c1.038 0 1.87-.855 1.87-1.908 0-1.514-1.721-5.016-4.635-8.228z" />
            </svg>
            <span>LINE ID：<span className="font-medium select-all">huanhuan0506</span></span>
          </div>
          {/* GitHub */}
          <a
            href="https://github.com/s780609/figurehub"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-base border-b border-[var(--card-border)] hover:bg-[var(--accent)]/10 transition-colors"
          >
            <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub Repo
          </a>
          {/* 常用PVC社團 */}
          <div className="px-4 py-2 text-xs text-[var(--foreground)]/40 font-medium">常用PVC社團</div>
          {groups.map((g) => (
            <a
              key={g.url}
              href={g.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-3 text-base hover:bg-[var(--accent)]/10 transition-colors last:rounded-b-lg"
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
