import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const navItems = [
    { label: "首頁", href: "/" },
    { label: "剪刀石頭布遊戲", href: "/rps" },
    { label: "關於我", href: "/about" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--text-primary)",
      }}
    >
      {/* Header 區域 */}
      <header
        style={{
          backgroundColor: "var(--card-background)",
          borderBottom: "1px solid var(--border-color)",
        }}
        className="shadow-lg"
      >
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-4 sm:gap-6 text-base">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 pb-1 transition-all duration-300 hover:scale-105 ${
                router.pathname === item.href
                  ? "font-medium"
                  : "border-transparent hover:border-opacity-50"
              }`}
              style={{
                borderBottomColor:
                  router.pathname === item.href
                    ? "var(--accent-gold)"
                    : "transparent",
                color:
                  router.pathname === item.href
                    ? "var(--accent-gold)"
                    : "var(--text-primary)",
              }}
              onMouseEnter={(e) => {
                if (router.pathname !== item.href) {
                  e.currentTarget.style.color = "var(--accent-gold)";
                  e.currentTarget.style.borderBottomColor =
                    "var(--accent-gold)";
                }
              }}
              onMouseLeave={(e) => {
                if (router.pathname !== item.href) {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main 區域 */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-grow">
        {children}
      </main>

      {/* Footer 區域 */}
      <footer
        className="w-full py-6 px-4 text-center text-sm"
        style={{
          color: "var(--text-muted)",
          borderTop: "1px solid var(--border-color)",
        }}
      >
        ©2025 0xShinyui. All rights reserved. Created with{" "}
        <span style={{ color: "var(--accent-gold)" }}>❤️</span>
      </footer>
    </div>
  );
}
