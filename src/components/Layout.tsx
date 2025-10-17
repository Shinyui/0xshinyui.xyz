import { ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Analytics } from "@vercel/analytics/next"

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "首頁", href: "/" },
    { label: "IP 查詢", href: "/ip" },
    { label: "2FA 生成", href: "/2fa" },
    { label: "剪刀石頭布遊戲", href: "/rps" },
    { label: "OTC 換匯計算機", href: "/otc" },
    { label: "關於我", href: "/about" },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand */}
            <Link
              href="/"
              className="text-xl font-bold"
              style={{ color: "var(--accent-gold)" }}
            >
              0xShinyui
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-6 text-base">
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

            {/* Mobile Hamburger Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg transition-colors duration-200"
              style={{
                color: "var(--text-primary)",
                backgroundColor: isMobileMenuOpen ? "var(--accent-gold)" : "transparent",
              }}
              onMouseEnter={(e) => {
                if (!isMobileMenuOpen) {
                  e.currentTarget.style.backgroundColor = "var(--border-color)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isMobileMenuOpen) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t" style={{ borderColor: "var(--border-color)" }}>
              <div className="flex flex-col space-y-3 pt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 ${
                      router.pathname === item.href ? "font-medium" : ""
                    }`}
                    style={{
                      backgroundColor:
                        router.pathname === item.href
                          ? "var(--accent-gold)"
                          : "transparent",
                      color:
                        router.pathname === item.href
                          ? "var(--background)"
                          : "var(--text-primary)",
                    }}
                    onMouseEnter={(e) => {
                      if (router.pathname !== item.href) {
                        e.currentTarget.style.backgroundColor = "var(--border-color)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (router.pathname !== item.href) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main 區域 */}
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 flex-grow">
        {children}
        <Analytics/>
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
