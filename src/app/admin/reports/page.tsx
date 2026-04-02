'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Users, Trophy, Heart } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminReportsPage() {
  const [data, setData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: activeUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
      const { count: monthlyUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'monthly')
      const { count: yearlyUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_plan', 'yearly')
      const { data: draws } = await supabase.from('draws').select('*')
      const { data: charityData } = await supabase.from('charities').select('name, total_received')
      const { count: totalWinners } = await supabase.from('winners').select('*', { count: 'exact', head: true })
      const { data: winners } = await supabase.from('winners').select('prize_amount')
      const totalPaid = winners?.reduce((a, w) => a + Number(w.prize_amount), 0) || 0
      const totalPooled = draws?.reduce((a, d) => a + Number(d.total_prize_pool), 0) || 0

      setData({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        monthlyUsers: monthlyUsers || 0,
        yearlyUsers: yearlyUsers || 0,
        totalDraws: draws?.length || 0,
        publishedDraws: draws?.filter(d => d.status === 'published').length || 0,
        totalPooled,
        totalPaid,
        totalWinners: totalWinners || 0,
        charities: charityData || [],
      })
      setLoading(false)
    })()
  }, [])

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" /></div>
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight mb-1">
          Reports & <span className="text-gradient-gold">Analytics</span>
        </h1>
        <p className="text-text-muted text-sm">Platform-wide statistics and insights</p>
      </motion.div>

      {/* User Stats */}
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text mb-4 flex items-center gap-2">
        <Users size={18} className="text-green" /> User Metrics
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Users', value: data.totalUsers, color: 'green' },
          { label: 'Active Subscribers', value: data.activeUsers, color: 'green' },
          { label: 'Monthly Plans', value: data.monthlyUsers, color: 'gold' },
          { label: 'Yearly Plans', value: data.yearlyUsers, color: 'gold' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card-elevated bg-white p-5">
            <div className="text-xs text-text-dim uppercase tracking-wider mb-2 font-[family-name:var(--font-heading)]">{item.label}</div>
            <div className={`text-3xl font-bold font-[family-name:var(--font-heading)] ${item.color === 'green' ? 'text-green-dark' : 'text-gold-deep'}`}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Draw Stats */}
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text mb-4 flex items-center gap-2">
        <Trophy size={18} className="text-gold-deep" /> Draw Statistics
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Draws', value: data.totalDraws },
          { label: 'Published', value: data.publishedDraws },
          { label: 'Total Prize Pool', value: formatCurrency(data.totalPooled) },
          { label: 'Total Paid Out', value: formatCurrency(data.totalPaid) },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 + 0.2 }} className="card-elevated bg-white p-5">
            <div className="text-xs text-text-dim uppercase tracking-wider mb-2 font-[family-name:var(--font-heading)]">{item.label}</div>
            <div className="text-2xl font-bold font-[family-name:var(--font-heading)] text-text">{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charity Breakdown */}
      <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text mb-4 flex items-center gap-2">
        <Heart size={18} className="text-green" /> Charity Contributions
      </h2>
      <div className="card-elevated bg-white p-6">
        {data.charities.length > 0 ? (
          <div className="space-y-4">
            {data.charities.map((c: any) => (
              <div key={c.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">{c.name}</span>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-2 rounded-full bg-surface-low overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green to-green-dark rounded-full" style={{ width: `${Math.min(100, Number(c.total_received) / 10)}%` }} />
                  </div>
                  <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-green-dark min-w-[80px] text-right">
                    {formatCurrency(Number(c.total_received))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm text-center py-8">No donation data yet</p>
        )}
      </div>
    </div>
  )
}
