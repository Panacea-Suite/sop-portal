'use client'

import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { useState } from 'react'
import Logo from './Logo'

export default function Navbar() {
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Logo href={isAdmin ? '/admin' : '/dashboard'} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {isAdmin ? (
              <>
                <Link 
                  href="/admin" 
                  className="text-gray-700 hover:text-[#FF1E25] px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl hover:bg-gray-50"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/staff" 
                  className="text-gray-700 hover:text-[#FF1E25] px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl hover:bg-gray-50"
                >
                  Staff
                </Link>
                <Link 
                  href="/admin/sops" 
                  className="text-gray-700 hover:text-[#FF1E25] px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl hover:bg-gray-50"
                >
                  SOPs
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-[#FF1E25] px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl hover:bg-gray-50"
                >
                  My SOPs
                </Link>
                <Link 
                  href="/dashboard/progress" 
                  className="text-gray-700 hover:text-[#FF1E25] px-4 py-2 text-sm font-semibold transition-colors duration-200 rounded-xl hover:bg-gray-50"
                >
                  Progress
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {session?.user?.name}
                </p>
                <span className={session?.user?.role === 'ADMIN' ? 'badge-admin text-xs' : 'badge-user text-xs'}>
                  {session?.user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="btn-small"
            >
              Sign Out
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-100">
            {isAdmin ? (
              <>
                <Link 
                  href="/admin" 
                  className="block text-gray-700 hover:text-[#FF1E25] px-4 py-3 text-base font-semibold rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/staff" 
                  className="block text-gray-700 hover:text-[#FF1E25] px-4 py-3 text-base font-semibold rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Staff
                </Link>
                <Link 
                  href="/admin/sops" 
                  className="block text-gray-700 hover:text-[#FF1E25] px-4 py-3 text-base font-semibold rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SOPs
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/dashboard" 
                  className="block text-gray-700 hover:text-[#FF1E25] px-4 py-3 text-base font-semibold rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My SOPs
                </Link>
                <Link 
                  href="/dashboard/progress" 
                  className="block text-gray-700 hover:text-[#FF1E25] px-4 py-3 text-base font-semibold rounded-xl hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Progress
                </Link>
              </>
            )}
            <div className="px-4 py-3 border-t border-gray-100 mt-2">
              <p className="text-sm font-semibold text-gray-900">{session?.user?.name}</p>
              <span className="text-xs text-gray-500">{session?.user?.role}</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
