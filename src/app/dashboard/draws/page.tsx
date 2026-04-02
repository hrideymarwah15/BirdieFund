'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { Trophy, Clock, Award, Gift, Calendar, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function DrawsPage() {
  const [draws, setDraws] = useState<{ id: string; draw_date: string; status: string; prize_pool: number; winning_numbers: number[] | null }[]>([])
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0, isDrawTime: false })
  const supabase = createClient()

  useEffect(() => {
    fetchDraws()
    const timer = setInterval(updateCountdown, 1000)
    updateCountdown() // initial Call
    return () => clearInterval(timer)
  }, [])

  useRealtimeSubscription('draws', (payload) => {
    if (payload.eventType === 'INSERT') {
      setDraws(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setDraws(prev => prev.map(d => d.id === payload.new.id ? payload.new : d))
    } else if (payload.eventType === 'DELETE') {
      setDraws(prev => prev.filter(d => d.id !== payload.old.id))
    }
  })

  const fetchDraws = async () => {
    const { data } = await supabase
      .from('draws')
      .select('*')
      .order('draw_date', { ascending: false })
      .limit(10)
    if (data) setDraws(data)
  }

  const updateCountdown = () => {
    const now = new Date()
    // For demo purposes, we'll set the draw date to the end of the current month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 20, 0, 0)
    const diff = endOfMonth.getTime() - now.getTime()
    
    if (diff <= 0) { 
      setCountdown({ d: 0, h: 0, m: 0, s: 0, isDrawTime: true })
      return 
    }
    
    setCountdown({
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
      isDrawTime: false
    })
  }

  const upcomingDraw = draws.find(d => d.status === 'pending')
  const pastDraws = draws.filter(d => d.status === 'completed')

  // Calculate dynamic prize pool - in a real app this would come from the upcomingDraw.prize_pool
  const currentEstPool = 12450 // Demo static number 

  return (
    <div className="pb-10">
      <div className="mb-8 pt-2">
        <h1 className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight">Prize Draws</h1>
        <p className="text-text-muted mt-1 text-sm">Monthly prize draws funded entirely by the community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Next Draw Countdown / Pool */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-dark to-green rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-green/20 h-full"
          >
            {/* Background assets */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 flex flex-col sm:flex-row justify-between h-full gap-8">
              
              <div className="flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-gold pulsing-dot" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Next Draw</span>
                  </div>
                  
                  <h2 className="text-5xl sm:text-6xl font-extrabold font-[family-name:var(--font-heading)] text-white tracking-tight mb-2">
                    £{currentEstPool.toLocaleString()}
                  </h2>
                  <p className="text-green-mist font-medium">Estimated Prize Pool</p>
                </div>
                
                <div className="mt-8 flex items-center gap-3 text-white/80 text-sm font-medium">
                  <Calendar size={18} className="text-gold" />
                  {upcomingDraw
                    ? new Date(upcomingDraw.draw_date).toLocaleDateString('en-GB', { weekday: 'long', month: 'long', day: 'numeric' })
                    : 'Scheduled for end of the month'}
                </div>
              </div>

              {/* Countdown Rings */}
              <div className="flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md self-start sm:self-auto min-w-[200px]">
                {countdown.isDrawTime ? (
                  <div className="text-center">
                    <Trophy className="w-16 h-16 text-gold mx-auto mb-3 animate-bounce" />
                    <div className="text-2xl font-bold font-[family-name:var(--font-heading)] text-white">Draw Time!</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-center w-full">
                    {[
                      { label: 'DAY', value: countdown.d },
                      { label: 'HRS', value: countdown.h },
                      { label: 'MIN', value: countdown.m },
                      { label: 'SEC', value: countdown.s }
                    ].map((unit, i) => (
                      <div key={unit.label} className="flex flex-col items-center">
                        <div className="w-12 h-14 bg-white/10 rounded-lg flex items-center justify-center mb-2 inset-shadow border border-white/5 relative overflow-hidden">
                          <AnimatePresence mode="popLayout">
                            <motion.span 
                              key={unit.value} 
                              initial={{ y: -20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: 20, opacity: 0 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                              className="text-xl font-bold font-[family-name:var(--font-heading)] text-white absolute"
                            >
                              {unit.value.toString().padStart(2, '0')}
                            </motion.span>
                          </AnimatePresence>
                        </div>
                        <span className="text-[9px] font-bold text-green-mist opacity-80 uppercase tracking-widest">{unit.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </div>

        {/* Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-outline relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold-light/50 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-deep to-gold-bright" />
          
          <div className="p-6 h-full flex flex-col">
            <div className="w-12 h-12 bg-gold-light rounded-xl flex items-center justify-center mb-6">
              <Gift size={24} className="text-gold-deep" />
            </div>
            <h3 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-3">How it works</h3>
            <p className="text-text-muted text-sm leading-relaxed mb-6">
              Your £10 entry fee goes directly into the pot. 20% goes to chosen charities. The rest is split between the lucky winners at the end of every month.
            </p>
            
            <div className="mt-auto space-y-3">
              {[
                { label: 'Match 5', pct: '50%' },
                { label: 'Match 4', pct: '30%' },
                { label: 'Match 3', pct: '20%' },
              ].map(tier => (
                <div key={tier.label} className="flex justify-between items-center bg-surface-base px-4 py-3 rounded-xl border border-outline">
                  <span className="text-sm font-bold text-text flex items-center gap-2">
                    <CheckCircle size={14} className="text-green" /> {tier.label}
                  </span>
                  <span className="text-sm font-bold text-gold-deep label-caps">{tier.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Past Draws */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl border border-outline p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-surface-mid to-surface-high" />
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-6">Past Results</h2>
        
        {pastDraws.length === 0 ? (
          <div className="bg-surface-low rounded-2xl p-10 text-center border border-outline border-dashed">
            <Trophy size={48} className="mx-auto text-surface-highest mb-4" />
            <h3 className="text-text font-bold mb-1">No past draws</h3>
            <p className="text-text-dim text-sm">Waiting for the first draw to complete.</p>
          </div>
        ) : (
          <div className="space-y-4">
             {/* Header Row */}
             <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-4 py-2 text-xs font-bold text-text-dim uppercase tracking-wider border-b border-outline mb-2">
               <div>Date</div>
               <div>Winning Numbers</div>
               <div>Prize Pool</div>
               <div className="text-right">Status</div>
             </div>
             
            {pastDraws.map((draw) => (
              <div key={draw.id} className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_1fr] gap-4 items-center bg-surface-low border border-outline/50 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all duration-300">
                <div>
                  <span className="font-bold text-sm text-text block sm:hidden uppercase tracking-widest text-[10px] text-text-muted mb-1">Date</span>
                  <span className="font-bold text-sm text-text">
                    {new Date(draw.draw_date).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                
                <div>
                  <span className="font-bold text-sm text-text block sm:hidden uppercase tracking-widest text-[10px] text-text-muted mt-2 mb-1">Winning Numbers</span>
                  <div className="flex flex-wrap gap-2">
                    {draw.winning_numbers?.map((n, i) => (
                      <span key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-green to-green-dark shadow-inner text-white text-sm font-bold flex items-center justify-center font-[family-name:var(--font-heading)]">
                        {n}
                      </span>
                    )) || <span className="text-sm text-text-dim italic">Pending verification</span>}
                  </div>
                </div>
                
                <div>
                  <span className="font-bold text-sm text-text block sm:hidden uppercase tracking-widest text-[10px] text-text-muted mt-2 mb-1">Total Pool</span>
                  <span className="text-lg font-bold font-[family-name:var(--font-heading)] text-green">
                    £{draw.prize_pool?.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <span className="font-bold text-sm text-text block sm:hidden uppercase tracking-widest text-[10px] text-text-muted mb-1">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-mist text-green-dark text-xs font-bold border border-green/20">
                    <CheckCircle size={12} />
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
