"use client";

import { useState, useCallback } from "react";

interface SkeletonImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "eager" | "lazy";
}

export default function SkeletonImage({
  src,
  alt,
  className = "",
  loading = "lazy",
}: SkeletonImageProps) {
  const [ready, setReady] = useState(false);

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      // decode() 確保圖片完全解碼、可以整張渲染後才顯示
      img
        .decode()
        .then(() => setReady(true))
        .catch(() => setReady(true)); // decode 失敗仍顯示圖片
    },
    [],
  );

  return (
    <>
      {/* 骨架：淡出而非瞬間消失 */}
      <div
        className={`absolute inset-0 skeleton-pulse transition-opacity duration-500 ${
          ready ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        className={`transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"} ${className}`}
      />
    </>
  );
}
