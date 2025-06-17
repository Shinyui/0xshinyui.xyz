import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    domains: ['ap-south-1.graphassets.com'], // ✅ 加上 Hygraph 的圖片網域
  },
  eslint: {
    ignoreDuringBuilds: true, // ❌ 不在 build 時執行 ESLint
  },
  reactStrictMode: true,
};

export default nextConfig;
