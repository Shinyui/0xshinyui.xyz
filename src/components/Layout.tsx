import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter()

  const navItems = [
    { label: '首頁', href: '/' },
    { label: '個人介紹', href: '/profile' },
    { label: '關於我', href: '/about' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex gap-6 text-base text-gray-700">
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

      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}