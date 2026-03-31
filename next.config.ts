import type { NextConfig } from "next";

// 嚴格 CSP（一般頁面）
const strictCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline'",
  "connect-src 'self' https://vercel.live https://va.vercel-scripts.com",
  "frame-src 'self' https://drive.google.com https://vercel.live",
  "font-src 'self' data:",
  "img-src 'self' data: https: blob:",
].join("; ");

// 寬鬆 CSP（ECPay SDK 付款頁面）
// unsafe-inline/unsafe-eval 為 ECPay JS SDK 所需
const ecpayCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ecpg.ecpay.com.tw https://ecpg-stage.ecpay.com.tw https://code.jquery.com https://cdn.jsdelivr.net https://va.vercel-scripts.com https://vercel.live",
  "style-src 'self' 'unsafe-inline' https://ecpg.ecpay.com.tw https://ecpg-stage.ecpay.com.tw",
  "connect-src 'self' https://ecpg.ecpay.com.tw https://ecpg-stage.ecpay.com.tw https://ecpayment.ecpay.com.tw https://ecpayment-stage.ecpay.com.tw https://cdn.jsdelivr.net https://vercel.live https://va.vercel-scripts.com",
  "frame-src 'self' https://*.ecpay.com.tw https://drive.google.com https://vercel.live",
  "font-src 'self' https://ecpg.ecpay.com.tw https://ecpg-stage.ecpay.com.tw data:",
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
      // ECPay SDK 付款頁面 — 需要寬鬆 CSP
      {
        source: "/u/:slug/figure/:id*",
        headers: [
          { key: "Content-Security-Policy", value: ecpayCsp },
        ],
      },
      // ECPay API routes
      {
        source: "/api/ecpay/:path*",
        headers: [
          { key: "Content-Security-Policy", value: ecpayCsp },
        ],
      },
      // 其他所有頁面 — 嚴格 CSP
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: strictCsp },
        ],
      },
    ];
  },
};

export default nextConfig;
