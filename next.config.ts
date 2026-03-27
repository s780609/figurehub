import type { NextConfig } from "next";

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
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://ecpg.ecpay.com.tw https://code.jquery.com https://cdn.jsdelivr.net https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://ecpg.ecpay.com.tw",
              "connect-src 'self' https://ecpg.ecpay.com.tw https://ecpg-stage.ecpay.com.tw https://ecpayment.ecpay.com.tw https://ecpayment-stage.ecpay.com.tw",
              "frame-src 'self' https://*.ecpay.com.tw",
              "img-src 'self' data: https: blob:",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
