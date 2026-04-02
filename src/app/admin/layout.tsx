'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, Users, Trophy, Heart, Award, BarChart3,
  LogOut, Menu, X, Shield, ChevronRight
} from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import { AdminLogin } from '@/components/admin/AdminLogin'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/draws', icon: Trophy, label: 'Draws' },
  { href: '/admin/charities', icon: Heart, label: 'Charities' },
  { href: '/admin/winners', icon: Award, label: 'Winners' },
  { href: '/admin/reports', icon: BarChart3, label: 'Reports' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const supabase = createClient()

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Strict admin check — only authorized emails
    const authorizedEmails = ['admin@birdiefund.com']
    
    if (session && authorizedEmails.includes(session.user.email || '')) {
      setIsAuthorized(true)
    } else {
      setIsAuthorized(false)
    }
    
    setLoading(false)
  }

  useEffect(() => {
    checkAuth()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthorized(false)
    router.push('/admin')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#052e16] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  // Render dedicated Admin Login if not authorized
  if (!isAuthorized) {
    return <AdminLogin onSuccess={checkAuth} />
  }

  return (
    <div className="min-h-screen bg-surface-low flex">
      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#052e16] fixed inset-y-0 left-0 z-30 shadow-2xl">
        <div className="p-6 border-b border-white/5">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <Logo variant="white" size="sm" />
          </Link>
          <div className="mt-4 px-2">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/30 block">Management Console</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active
                    ? 'bg-white/10 text-white shadow-[0_4px_12px_rgba(255,255,255,0.05)]'
                    : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {active && <ChevronRight size={14} className="ml-auto" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-white hover:bg-white/[0.03] transition-all w-full mb-1">
            ← Back to Dashboard
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#052e16] px-4 py-3 flex items-center justify-between border-b border-white/5">
        <Logo variant="white" size="sm" />
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-white/70">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {sidebarOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-navy-deep flex flex-col shadow-xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <span className="text-base font-bold text-white">Admin Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="text-white/50"><X size={20} /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon size={18} /> {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 transition-all w-full">
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </aside>
        </>
      )}

      <main className="lg:ml-64 flex-1 min-h-screen pt-14 lg:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
