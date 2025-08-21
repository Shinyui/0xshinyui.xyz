import React from "react";
import Layout from "@/components/Layout";
import { GetServerSideProps } from "next";

type IpPageProps = {
  ip: string;
  userAgent: string;
  timestamp: string;
};

export default function IpPage({ ip, userAgent, timestamp }: IpPageProps) {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-6"
          style={{ color: "var(--text-primary)" }}
        >
          訪問者資訊
        </h1>

        <div className="space-y-6">
          {/* IP 地址卡片 */}
          <div
            className="p-6 rounded-lg border transition-all duration-300 hover:shadow-xl"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              boxShadow: "0 4px 6px var(--shadow-color)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--accent-gold)" }}
            >
              您的 IP 地址
            </h2>
            <p
              className="text-2xl font-mono font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              {ip}
            </p>
          </div>

          {/* 瀏覽器資訊卡片 */}
          <div
            className="p-6 rounded-lg border transition-all duration-300 hover:shadow-xl"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              boxShadow: "0 4px 6px var(--shadow-color)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--accent-gold)" }}
            >
              瀏覽器資訊
            </h2>
            <p
              className="text-sm break-all"
              style={{ color: "var(--text-secondary)" }}
            >
              {userAgent}
            </p>
          </div>

          {/* 訪問時間卡片 */}
          <div
            className="p-6 rounded-lg border transition-all duration-300 hover:shadow-xl"
            style={{
              backgroundColor: "var(--card-background)",
              borderColor: "var(--border-color)",
              boxShadow: "0 4px 6px var(--shadow-color)",
            }}
          >
            <h2
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--accent-gold)" }}
            >
              訪問時間
            </h2>
            <p
              className="text-lg"
              style={{ color: "var(--text-primary)" }}
            >
              {timestamp}
            </p>
          </div>

          {/* 說明文字 */}
          <div
            className="p-4 rounded-lg border-l-4 bg-opacity-50"
            style={{
              backgroundColor: "var(--card-background)",
              borderLeftColor: "var(--accent-gold)",
            }}
          >
            <p
              className="text-sm"
              style={{ color: "var(--text-secondary)" }}
            >
              💡 這個頁面會顯示您連接到此網站時的 IP 地址和相關資訊。每次重新整理頁面都會更新時間戳記。
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { req } = context;
  
  // 獲取真實 IP 地址（考慮代理和負載均衡器）
  const forwarded = req.headers["x-forwarded-for"] as string;
  const realIp = req.headers["x-real-ip"] as string;
  const ip = forwarded
    ? forwarded.split(",")[0].trim()
    : realIp || req.socket.remoteAddress || "未知";

  // 獲取 User Agent
  const userAgent = req.headers["user-agent"] || "未知瀏覽器";

  // 獲取當前時間戳
  const timestamp = new Date().toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return {
    props: {
      ip,
      userAgent,
      timestamp,
    },
  };
};