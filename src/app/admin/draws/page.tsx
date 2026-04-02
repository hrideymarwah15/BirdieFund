'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Trophy, Play, Send, Shuffle } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [simulatedNumbers, setSimulatedNumbers] = useState<number[]>([])
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const supabase = createClient()

  const fetchDraws = async () => {
    const { data } = await supabase.from('draws').select('*').order('draw_date', { ascending: false })
    setDraws(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchDraws() }, [])

  const generateRandomNumbers = (): number[] => {
    const numbers = new Set<number>()
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
  }

  const simulateDraw = () => {
    setSimulating(true)
    let count = 0
    const interval = setInterval(() => {
      setSimulatedNumbers(generateRandomNumbers())
      count++
      if (count >= 10) {
        clearInterval(interval)
        setSimulating(false)
      }
    }, 150)
  }

  const publishDraw = async (drawId: string) => {
    if (simulatedNumbers.length !== 5) {
      alert('Simulate a draw first!')
      return
    }
    
    setSimulating(true)
    
    // Call the hardened RPC function for atomic processing
    const { data, error } = await supabase.rpc('process_draw', {
      p_draw_id: drawId,
      p_winning_numbers: simulatedNumbers
    })

    setSimulating(false)

    if (error || !data?.success) {
      alert(`Error publishing draw: ${error?.message || data?.error || 'Unknown error'}`)
    } else {
      await fetchDraws()
      setSimulatedNumbers([])
      alert('Draw results published successfully! All winning entries have been updated.')
    }
  }

  const createNewDraw = async () => {
    const nextMonth = new Date()
    nextMonth.setMonth(nextMonth.getMonth() + 1)
    nextMonth.setDate(15)
    await supabase.from('draws').insert({ draw_date: nextMonth.toISOString().split('T')[0], status: 'pending', draw_type: drawType })
    await fetchDraws()
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight mb-1">
          Draw <span className="text-gradient-gold">Management</span>
        </h1>
        <p className="text-text-muted text-sm">Configure, simulate, and publish monthly draws</p>
      </motion.div>

      {/* Simulation Panel */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-outline shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-48 h-48 bg-gold-light blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
        <div className="relative z-10 p-6 sm:p-8">
          <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center shadow-sm">
              <Shuffle size={20} className="text-gold-deep" />
            </div>
            Draw Simulator Engine
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 pl-1">Algorithm Selection</div>
              <div className="flex bg-surface-low border border-outline/50 rounded-2xl p-1.5 w-max">
                {['random', 'algorithmic'].map((type) => (
                  <button key={type} onClick={() => setDrawType(type as any)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all capitalize ${
                      drawType === type ? 'bg-white text-gold-deep shadow-sm border border-gold/20' : 'text-text-dim hover:text-text'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:items-end lg:justify-end">
              <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3 pl-1">Live Result Feed</div>
              <div className="flex gap-2 sm:gap-3">
                {(simulatedNumbers.length > 0 ? simulatedNumbers : [0, 0, 0, 0, 0]).map((n, i) => (
                  <motion.div key={i}
                    animate={simulating ? { scale: [1, 1.15, 1], rotate: [0, 5, -5, 0], opacity: [0.5, 1, 0.5] } : { scale: 1, rotate: 0, opacity: 1 }}
                    transition={simulating ? { duration: 0.15, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] shadow-sm transition-colors duration-300 ${
                      n > 0 ? 'bg-gradient-to-br from-gold-deep to-gold text-white shadow-gold/20 outline outline-1 outline-white/20 outline-offset-[-2px]' : 'bg-surface-mid text-text-dim border border-outline border-dashed'
                    }`}
                  >
                    {n > 0 ? n : '?'}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-6 border-t border-outline/50">
            <button onClick={simulateDraw} disabled={simulating} className="btn-primary !bg-gold-deep hover:!bg-gold-light focus:ring-gold/20 hover:!text-gold-deep !text-white flex items-center gap-2 disabled:opacity-50 px-8 py-3.5 shadow-gold/20 shadow-lg">
              <Play size={16} className={simulating ? 'animate-pulse' : ''} />
              {simulating ? 'Simulating Sequence...' : 'Initialize Simulation'}
            </button>
            <button onClick={createNewDraw} className="btn-secondary flex items-center gap-2 px-8 py-3.5 bg-surface-low border-outline hover:bg-surface-mid">
              <Trophy size={16} className="text-text-muted" />
              Stage Next Draw
            </button>
          </div>
        </div>
      </motion.div>

      {/* Draw List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-6 pl-2">Draw History</h2>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {draws.map((draw) => (
              <div key={draw.id} className="p-6 rounded-3xl bg-white border border-outline shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md hover:border-outline/80 transition-all duration-300 group">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-lg text-text font-[family-name:var(--font-heading)]">{formatDate(draw.draw_date)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      draw.status === 'published' ? 'bg-green-mist text-green-dark border-green/20' : draw.status === 'simulated' ? 'bg-gold-light text-gold-deep border-gold/20' : 'bg-surface-mid text-text-muted border-outline'
                    }`}>
                      {draw.status}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-surface-low text-text-dim border border-outline/50 text-[10px] font-bold uppercase tracking-widest">{draw.draw_type}</span>
                  </div>
                  {draw.winning_numbers?.length > 0 ? (
                    <div className="flex gap-2">
                      {draw.winning_numbers.map((n: number, i: number) => (
                        <span key={i} className="w-10 h-10 rounded-xl bg-gold-light border border-gold/20 shadow-sm flex items-center justify-center text-sm font-bold font-[family-name:var(--font-heading)] text-gold-deep group-hover:scale-105 transition-transform duration-300" style={{ transitionDelay: `${i * 50}ms` }}>{n}</span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex gap-2 opacity-50">
                       {[0,0,0,0,0].map((_, i) => <span key={i} className="w-10 h-10 rounded-xl bg-surface-mid border border-outline border-dashed flex items-center justify-center text-sm font-bold text-text-dim">?</span>)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 sm:pl-6 sm:border-l border-outline/50">
                  <div className="text-left sm:text-right flex-grow">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1.5 pl-1">Prize Pool</div>
                    <div className="text-2xl font-bold font-[family-name:var(--font-heading)] text-green-dark bg-green-mist px-4 py-2 rounded-xl inline-block border border-green/20">
                      {formatCurrency(Number(draw.total_prize_pool))}
                    </div>
                  </div>
                  {draw.status === 'pending' && simulatedNumbers.length === 5 && (
                    <button onClick={() => publishDraw(draw.id)} className="btn-primary !px-6 !py-3.5 flex items-center gap-2 shadow-green/20 shadow-lg shrink-0">
                      <Send size={16} /> Publish Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
