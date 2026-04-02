'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Award, DollarSign, CheckCircle, Clock, Trophy, Upload } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import WinnerProofUpload from '@/components/winnings/WinnerProofUpload'

export default function WinningsPage() {
  const [winnings, setWinnings] = useState<{ 
    id: string; 
    prize_amount: number; 
    matched_count: number; 
    verified: boolean; 
    paid: boolean; 
    created_at: string; 
    proof_image_url?: string; 
    verification_status?: string 
  }[]>([])
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null)
  const supabase = createClient()

  const fetchWinnings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setWinnings(data)
  }

  useEffect(() => {
    fetchWinnings()
  }, [])

  const totalWon = winnings.reduce((a, w) => a + (w.prize_amount || 0), 0)
  const verified = winnings.filter(w => w.verified).length
  const pending = winnings.filter(w => !w.verified).length

  return (
    <div className="pb-10">
      <div className="mb-8 pt-2">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-text tracking-tight">My Winnings</h1>
        <p className="text-text-muted mt-1 text-sm">Track your prizes, match counts, and payment status.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Won Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-1 bg-gradient-to-br from-gold-deep to-gold p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-gold/10"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-2xl rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 border border-black/10 mb-6 backdrop-blur-sm">
                <DollarSign size={14} className="text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Total Earned</span>
              </div>
              <div className="text-5xl font-extrabold font-[family-name:var(--font-heading)] text-white tracking-tight mb-1">
                £{totalWon.toLocaleString()}
              </div>
              <p className="text-white/80 text-sm font-medium">Lifetime Winnings</p>
            </div>
            <Award className="w-16 h-16 text-white/20 absolute bottom-6 right-6" />
          </div>
        </motion.div>

        {/* Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: 'Verified Wins', value: verified, icon: CheckCircle, desc: 'Ready for payout', color: 'green' },
            { label: 'Pending Verification', value: pending, icon: Clock, desc: 'Being processed', color: 'gray' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-outline p-6 relative overflow-hidden flex flex-col justify-center"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 blur-[40px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none ${
                stat.color === 'green' ? 'bg-green-mist' : 'bg-surface-high'
              }`} />
              
              <div className="flex items-center gap-4 mb-3 relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${
                  stat.color === 'green' ? 'bg-green-mist border-green/20' : 'bg-surface-low border-outline'
                }`}>
                  <stat.icon size={22} className={stat.color === 'green' ? 'text-green-dark' : 'text-text-dim'} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</div>
                  <div className="text-3xl font-[family-name:var(--font-heading)] text-text font-bold leading-none mt-1">{stat.value}</div>
                </div>
              </div>
              <p className="text-sm text-text-dim relative z-10 pl-16">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl border border-outline p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-surface-mid to-surface-high" />
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-6">Prize History</h2>
        
        {winnings.length === 0 ? (
          <div className="bg-surface-low rounded-2xl p-10 text-center border border-outline border-dashed">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-outline/50">
              <Trophy size={32} className="text-surface-highest" />
            </div>
            <h3 className="text-lg font-[family-name:var(--font-heading)] text-text mb-1 font-bold">No prizes yet</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto">Keep entering your scores to participate in the upcoming draws. Your winning history will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr] gap-4 px-4 py-2 text-[10px] font-bold text-text-dim uppercase tracking-widest border-b border-outline mb-2">
              <div>Amount</div>
              <div>Match Detail</div>
              <div className="text-right">Status</div>
            </div>
            
            {winnings.map((w) => (
              <div key={w.id} className="overflow-hidden bg-surface-low border border-outline/50 rounded-2xl hover:bg-white hover:shadow-sm transition-all duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr] gap-4 items-center p-4">
                  <div>
                    <span className="font-bold text-sm text-text block sm:hidden uppercase tracking-widest text-[10px] text-text-muted mb-1">Amount</span>
                    <span className="text-2xl font-bold font-[family-name:var(--font-heading)] text-gold-deep">
                      £{w.prize_amount?.toLocaleString()}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-bold text-sm text-text block sm:hidden uppercase tracking-widest text-[10px] text-text-muted mt-2 mb-1">Match Detail</span>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green text-white text-xs font-bold flex items-center justify-center">
                        {w.matched_count}
                      </span>
                      <span className="text-sm font-medium text-text">Numbers matched</span>
                    </div>
                    <span className="text-xs text-text-dim mt-1.5 block">
                      {new Date(w.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="text-left sm:text-right mt-2 sm:mt-0">
                    <span className="font-bold text-sm text-text block sm:hidden uppercase tracking-widest text-[10px] text-text-muted mb-1">Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      w.verified 
                        ? w.paid 
                          ? 'bg-green-mist text-green-dark border-green/20' 
                          : 'bg-gold-light text-gold-deep border-gold/20'
                        : 'bg-surface-mid text-text-muted border-outline'
                    }`}>
                      {w.verified ? <CheckCircle size={12} /> : <Clock size={12} />}
                      {w.verified ? (w.paid ? 'Paid' : 'Verified') : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Upload Proof Area */}
                <AnimatePresence>
                  {selectedWinner === w.id && !w.verified && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-white border-t border-outline/50">
                        <WinnerProofUpload 
                          winnerId={w.id} 
                          onSuccess={() => {
                            fetchWinnings()
                            setSelectedWinner(null)
                          }} 
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!w.verified && !w.proof_image_url && selectedWinner !== w.id && (
                  <div className="p-4 border-t border-outline/30 bg-surface-low/50">
                    <button 
                      onClick={() => setSelectedWinner(w.id)}
                      className="flex items-center gap-2 text-xs font-bold text-gold-deep hover:text-gold transition-colors"
                    >
                      <Upload size={14} />
                      Upload Score Proof to Verify Payout
                    </button>
                  </div>
                )}

                {w.verification_status === 'pending' && (
                  <div className="p-4 border-t border-outline/30 bg-surface-low/50">
                    <div className="flex items-center gap-2 text-xs font-bold text-text-dim italic">
                      <Clock size={14} />
                      Proof submitted. Verification in progress...
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
