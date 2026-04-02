'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Users, Trophy, Heart, Award, TrendingUp, DollarSign, Shield } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, activeUsers: 0, totalPool: 0, totalCharity: 0, draws: 0, winners: 0 })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: activeCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
      const { data: draws } = await supabase.from('draws').select('total_prize_pool')
      const { data: donations } = await supabase.from('charity_donations').select('amount')
      const { count: drawCount } = await supabase.from('draws').select('*', { count: 'exact', head: true })
      const { count: winnerCount } = await supabase.from('winners').select('*', { count: 'exact', head: true })

      const totalPool = draws?.reduce((a, d) => a + Number(d.total_prize_pool), 0) || 0
      const totalCharity = donations?.reduce((a, d) => a + Number(d.amount), 0) || 0

      setStats({
        users: userCount || 0,
        activeUsers: activeCount || 0,
        totalPool,
        totalCharity,
        draws: drawCount || 0,
        winners: winnerCount || 0,
      })
      setLoading(false)
    })()
  }, [])

  const cards = [
    { icon: Users, label: 'Total Users', value: stats.users, color: 'green' },
    { icon: TrendingUp, label: 'Active Subscribers', value: stats.activeUsers, color: 'green' },
    { icon: DollarSign, label: 'Total Prize Pool', value: formatCurrency(stats.totalPool), color: 'gold' },
    { icon: Heart, label: 'Charity Donations', value: formatCurrency(stats.totalCharity), color: 'green' },
    { icon: Trophy, label: 'Total Draws', value: stats.draws, color: 'gold' },
    { icon: Award, label: 'Total Winners', value: stats.winners, color: 'gold' },
  ]

  return (
    <div className="pb-20 relative overflow-hidden">
      {/* ── Luxury Background Elements ── */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-mist opacity-20 blur-[120px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2" />
      
      {/* Grain Texture */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay z-0" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10 pt-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-outline shadow-sm mb-4">
          <Shield size={14} className="text-green-dark" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Global Control Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-heading)] text-text tracking-tight mb-2">
          Admin <span className="text-green-dark italic pr-2">Overview</span>
        </h1>
        <p className="text-text-muted text-lg leading-relaxed max-w-xl">Platform analytics and key metrics for the elite series dashboard.</p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-outline p-8 relative overflow-hidden flex flex-col justify-center shadow-xl shadow-black/[0.02] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/[0.05] group"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all group-hover:scale-125 opacity-40 ${
                card.color === 'green' ? 'bg-green' : 'bg-gold'
              }`} />
              
              <div className="flex flex-col gap-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner shrink-0 transition-transform duration-500 group-hover:rotate-[10deg] ${
                  card.color === 'green' ? 'bg-green-mist border-green/10' : 'bg-gold-light border-gold/10'
                }`}>
                  <card.icon size={28} className={card.color === 'green' ? 'text-green-dark' : 'text-gold-deep'} />
                </div>
                
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] leading-tight opacity-70">{card.label}</div>
                  <div className={`text-4xl font-[family-name:var(--font-heading)] font-black leading-none tracking-tighter ${
                    card.color === 'green' ? 'text-green-dark' : 'text-gold-deep'
                  }`}>
                    {card.value}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
