'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, ArrowRight, Eye, EyeOff, Shield, Heart } from 'lucide-react'
import { Logo } from '@/components/shared/Logo'
import Image from 'next/image'
import { useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const redirectPath = session.user.email === 'admin@birdiefund.com' ? '/admin' : '/dashboard'
        router.replace(redirectPath)
      }
    })
  }, [router, supabase])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signInError, data } = await supabase.auth.signInWithPassword({ email, password })
    
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      const redirectPath = data.user?.email === 'admin@birdiefund.com' ? '/admin' : '/dashboard'
      router.push(redirectPath)
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-surface overflow-hidden">
      {/* ── Left Panel: Cinematic Brand Experience ── */}
      <div className="hidden lg:flex relative bg-green-deep flex-col justify-between p-12 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero_golf_premium_1775018252317.png" 
            alt="Elite Golf Course" 
            fill 
            className="object-cover opacity-40 mix-blend-luminosity"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-br from-green-deep/90 via-green-deep/40 to-transparent z-10" />
        </div>

        {/* Content */}
        <div className="relative z-20">
          <Link href="/">
            <Logo variant="white" />
          </Link>
        </div>

        <div className="relative z-20 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl xl:text-5xl font-[family-name:var(--font-heading)] text-white font-bold leading-tight mb-6">
              More than a game. <br />
              <span className="text-green-light">A shared legacy.</span>
            </h2>
            <p className="text-white/60 text-lg max-w-md leading-relaxed mb-8">
              Join the elite circle of golfers who play for prizes and fund the causes that matter.
            </p>
          </motion.div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Shield size={20} className="text-green-light" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">Verified Fairness</div>
                <div className="text-white/40 text-xs uppercase tracking-widest">Independent Audits</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Heart size={20} className="text-green-light" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">£50,000+ Raised</div>
                <div className="text-white/40 text-xs uppercase tracking-widest">To Global Charities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Trust Indicator */}
        <div className="relative z-20 mt-auto">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-green-deep bg-green-light/20 flex items-center justify-center text-[8px] text-white font-bold">
                  {i}
                </div>
              ))}
            </div>
            <span className="text-white/50 text-[10px] uppercase tracking-widest font-bold">Trusted by 2,500+ Golfers</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Luxury Auth Interface ── */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative text-text">
        {/* Decorative Background for Mobile */}
        <div className="lg:hidden absolute inset-0 bg-[#052e16] z-0">
          <Image 
            src="/hero_golf_premium_1775018252317.png" 
            alt="Golf Course" 
            fill 
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#052e16]/80 to-[#052e16]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-sm z-10 bg-white lg:bg-transparent p-8 sm:p-10 rounded-3xl shadow-xl lg:shadow-none"
        >
          <div className="lg:hidden mb-10 flex justify-center">
            <Logo variant="dark" />
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)] mb-2">Welcome back</h1>
            <p className="text-text-muted text-sm font-medium">Continue your journey with BirdieFund</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-error-light border border-red-200 rounded-xl px-4 py-3 mb-6 text-error text-sm font-medium"
            >
              {error}
            </motion.div>
          )}

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-outline rounded-xl bg-white hover:bg-surface-low transition-all font-bold text-sm mb-6 group shadow-sm hover:shadow-md"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-[1px] bg-outline" />
            <span className="text-text-dim text-[10px] uppercase tracking-widest font-bold">Secure Access</span>
            <div className="flex-1 h-[1px] bg-outline" />
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block">Email Address</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-green transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field !pl-12 !h-12 border-outline hover:border-green focus:border-green-dark"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-green transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field !pl-12 !pr-12 !h-12 border-outline hover:border-green focus:border-green-dark"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-3 !py-3.5 !rounded-xl shadow-lg shadow-green/20 hover:shadow-green/30 disabled:opacity-50 transition-all font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign in to BirdieFund
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-text-muted text-sm mt-10">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-green hover:text-green-dark transition-colors font-bold underline decoration-green/30 underline-offset-4">
              Sign up today
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Decorative Textures */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      </div>
    </div>
  )
}
