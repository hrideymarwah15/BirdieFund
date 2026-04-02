'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shared/Logo'

interface AdminLoginProps {
  onSuccess: () => void
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Strict email check
    if (email !== 'admin@birdiefund.com') {
      setError('Access restricted to master administrative account.')
      setLoading(false)
      return
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
    } else {
      onSuccess()
    }
  }

  return (
    <div className="min-h-screen bg-green-deep flex items-center justify-center p-6 relative overflow-hidden">
      {/* ── Cinematic Background ── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#022c22] mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-deep via-[#014737] to-[#012a20]" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 -right-20 w-96 h-96 bg-green-light/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-gold/5 blur-[150px] rounded-full" 
        />
      </div>

      {/* Grain Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay z-10" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-12">
          <Logo variant="white" size="lg" />
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
              <Shield size={14} className="text-green-light" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Secure Console</span>
            </div>
            <h1 className="text-3xl font-[family-name:var(--font-heading)] text-white font-black tracking-tight">Management Access</h1>
            <p className="text-white/40 text-sm mt-2">Elite oversight for the global series.</p>
          </div>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-10 shadow-2xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mb-8"
              >
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
                  <span className="text-red-200/80 text-sm font-medium">{error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Administrative Node</label>
              <div className="relative group/input">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-green-light transition-colors" />
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 text-white placeholder:text-white/10 focus:outline-none focus:border-green-light focus:bg-white/10 transition-all opacity-70 cursor-not-allowed"
                  placeholder="admin@birdiefund.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/30 uppercase tracking-widest px-1">Access Credentials</label>
              <div className="relative group/input">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/input:text-green-light transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl h-14 pl-12 pr-12 text-white placeholder:text-white/10 focus:outline-none focus:border-green-light focus:bg-white/10 transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-white text-green-deep rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-green-light transition-all active:scale-95 disabled:opacity-50 disabled:cursor-wait mt-4 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-green-deep border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 flex items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-1 opacity-20">
            <div className="text-[10px] uppercase font-bold text-white tracking-widest">TLS 1.3</div>
            <div className="h-[2px] w-8 bg-white/50 rounded-full" />
          </div>
          <div className="flex flex-col items-center gap-1 opacity-20">
            <div className="text-[10px] uppercase font-bold text-white tracking-widest">ISO 27001</div>
            <div className="h-[2px] w-8 bg-white/50 rounded-full" />
          </div>
          <div className="flex flex-col items-center gap-1 opacity-20">
            <div className="text-[10px] uppercase font-bold text-white tracking-widest">SOC 2</div>
            <div className="h-[2px] w-8 bg-white/50 rounded-full" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}
