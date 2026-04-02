'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LayoutDashboard, ClipboardList, Trophy, Heart, Award,
  Settings, LogOut, ChevronRight, Menu, X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/scores', icon: ClipboardList, label: 'Scores' },
  { href: '/dashboard/draws', icon: Trophy, label: 'Draws' },
  { href: '/dashboard/charity', icon: Heart, label: 'Charity' },
  { href: '/dashboard/winnings', icon: Award, label: 'Winnings' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

const bottomNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/scores', icon: ClipboardList, label: 'Scores' },
  { href: '/dashboard/draws', icon: Trophy, label: 'Draws' },
  { href: '/dashboard/charity', icon: Heart, label: 'Charity' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-bg flex">
      {/* ═══ Desktop Sidebar — Dark Theme ═══ */}
      <motion.aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        animate={{ width: hovered ? 240 : 72 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col bg-surface-dark fixed inset-y-0 left-0 z-30 overflow-hidden border-r border-white/5"
      >
        {/* Brand */}
        <div className="px-4 py-6 border-b border-white/8 flex items-center gap-3 min-h-[72px]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center flex-shrink-0 shadow-md shadow-green/20">
              <span className="text-white font-bold text-sm font-[family-name:var(--font-heading)]">B</span>
            </div>
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="text-base font-bold font-[family-name:var(--font-heading)] text-white tracking-tight whitespace-nowrap"
                >
                  Birdie<span className="text-green-light">Fund</span>
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all relative group ${
                  active
                    ? 'text-white'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-green/15 border border-green/25 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg relative z-10 ${
                  active ? 'text-green-light' : ''
                }`}>
                  <item.icon size={20} />
                </div>
                <AnimatePresence>
                  {hovered && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                      className="relative z-10 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Tooltip when collapsed */}
                {!hovered && (
                  <div className="absolute left-[68px] bg-surface-dark text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg border border-white/10 z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
          >
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
              <LogOut size={20} />
            </div>
            <AnimatePresence>
              {hovered && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                  className="whitespace-nowrap"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* ═══ Main Content ═══ */}
      <main className="flex-1 lg:ml-[72px] min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* ═══ Mobile Bottom Navigation ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-outline/60 safe-b">
        <div className="flex items-center justify-around px-2 py-1.5">
          {bottomNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all relative ${
                  active ? 'text-green' : 'text-text-dim'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="mobileActiveTab"
                    className="absolute -top-1.5 w-8 h-1 bg-green rounded-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <item.icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className={`text-[10px] ${active ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
