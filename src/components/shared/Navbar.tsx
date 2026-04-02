'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LogOut, Settings, User, LayoutDashboard, ChevronDown, Shield, ChevronRight } from 'lucide-react'
import { Logo } from './Logo'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    
    // Check auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      if (session) {
        supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({ data }) => {
          setIsAdmin(data?.role === 'admin')
        })
      }
    })
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => {
      window.removeEventListener('scroll', onScroll)
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfileOpen(false)
    setMobileOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl border-b border-outline shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={isLoggedIn === true ? "/dashboard" : "/"} className="flex items-center">
          <Logo variant={scrolled ? 'dark' : 'white'} />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex items-center gap-6">
            {[
              { href: '/#how-it-works', label: 'How It Works' },
              { href: '/#charities', label: 'Charities' },
              { href: '/#pricing', label: 'Pricing' },
            ].map((link) => (
              <div key={link.href} className="relative group">
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors py-2 ${
                    scrolled
                      ? 'text-text-muted hover:text-green'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
                <div className={`absolute bottom-0 left-0 w-full h-[2px] scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 ${
                  scrolled ? 'bg-green' : 'bg-white'
                }`} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 border-l pl-4 border-outline/30">
            {isLoggedIn === null ? (
              <div className="w-20 h-9 bg-surface-highest/10 animate-pulse rounded-full" />
            ) : isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border transition-all duration-300 ${
                    scrolled
                      ? 'border-outline bg-surface hover:bg-surface-highest/5'
                      : 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-green text-white flex items-center justify-center text-[10px] font-bold">
                    <User size={14} />
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-outline py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-2 border-b border-outline mb-1">
                        <p className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Account</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-green-mist hover:text-green-dark transition-colors"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-green-mist hover:text-green-dark transition-colors"
                        >
                          <Shield size={16} /> Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/dashboard/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-green-mist hover:text-green-dark transition-colors"
                      >
                        <Settings size={16} /> Settings
                      </Link>
                      <hr className="divider my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut size={16} /> Log Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium transition-colors ${
                    scrolled ? 'text-text hover:text-green' : 'text-white hover:text-white/80'
                  }`}
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className={`btn-primary text-sm !py-2.5 !px-5 ${
                    scrolled ? '' : '!bg-white !text-green shadow-none hover:opacity-90'
                  }`}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          className={`md:hidden ${scrolled ? 'text-text' : 'text-white'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-outline overflow-hidden shadow-2xl"
          >
            <div className="px-6 py-8 flex flex-col gap-5">
              <Link href="/#how-it-works" className="text-text font-medium flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                How It Works <ChevronRight size={16} className="text-text-muted" />
              </Link>
              <Link href="/#charities" className="text-text font-medium flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                Charities <ChevronRight size={16} className="text-text-muted" />
              </Link>
              <Link href="/#pricing" className="text-text font-medium flex items-center justify-between" onClick={() => setMobileOpen(false)}>
                Pricing <ChevronRight size={16} className="text-text-muted" />
              </Link>

              <div className="pt-4 border-t border-outline flex flex-col gap-4">
                {isLoggedIn === null ? (
                  <div className="h-10 w-full bg-surface-highest/5 animate-pulse rounded-xl" />
                ) : isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 p-4 bg-green-mist rounded-2xl text-green-dark font-bold"
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard size={20} /> Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 p-4 bg-navy-deep rounded-2xl text-white font-bold"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Shield size={20} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 p-4 text-red-500 font-medium"
                    >
                      <LogOut size={20} /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="btn-secondary w-full text-center py-4"
                      onClick={() => setMobileOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="btn-primary w-full text-center py-4"
                      onClick={() => setMobileOpen(false)}
                    >
                      Join BirdieFund
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
