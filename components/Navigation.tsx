'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Navigation() {
  const pathname = usePathname()

  const links = [
    { href: '/', label: 'Home' },
    { href: '/standings', label: 'Standings by Year' },
    { href: '/performance', label: 'Season Performance' },
    { href: '/superlatives', label: 'Superlatives' },
    { href: '/draft', label: 'Draft Positions' },
    { href: '/cumulative-standings', label: 'Cumulative Standings' },
    { href: '/hall-of-fame', label: 'Hall of Fame' },
  ]

  return (
    <nav className="bg-white dark:bg-dark-surface shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'border-blue-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}