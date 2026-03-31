import type { NextConfig } from "next";

// CSP（所有頁面共用）
// AIO 金流使用全頁跳轉，不需要載入 ECPay JS SDK，無需寬鬆 CSP
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://vercel.live https://va.vercel-scripts.com",
  "frame-src 'self' https://drive.google.com https://vercel.live",
  "font-src 'self' data:",
  "img-src 'self' data: https: blob:",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
