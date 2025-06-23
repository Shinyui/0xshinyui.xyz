import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const navItems = [
    { label: '首頁', href: '/' },
    { label: '關於我', href: '/about' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      {/* Header 區域 */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-4 sm:gap-6 text-base text-gray-700">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`border-b-2 pb-1 transition-colors ${
                router.pathname === item.href
                  ? 'border-blue-500 text-blue-600 font-medium'
                  : 'border-transparent hover:border-gray-300 hover:text-blue-500'
              }`}
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
      <footer className="w-full py-6 px-4 text-center text-sm text-gray-500">
        ©2025 0xShinyui. All rights reserved. Created with ❤️
      </footer>
    </div>
  )
}