'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Award, CheckCircle, XCircle, DollarSign, Image as ImageIcon, ExternalLink, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchWinners = async () => {
    const { data } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(draw_date, winning_numbers)')
      .order('created_at', { ascending: false })
    setWinners(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchWinners()
  }, [])

  const updateVerification = async (id: string, status: string) => {
    await supabase.from('winners').update({ verification_status: status }).eq('id', id)
    await fetchWinners()
  }

  const markPaid = async (id: string) => {
    await supabase.from('winners').update({ payment_status: 'paid', paid_at: new Date().toISOString() }).eq('id', id)
    await fetchWinners()
  }

  return (
    <div className="pb-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 pt-4">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-text tracking-tight mb-2">
          Winner <span className="text-gold-deep italic pr-2">Verification</span>
        </h1>
        <p className="text-text-muted text-lg">Verify winners and manage payouts.</p>
      </motion.div>

      <div className="bg-white rounded-3xl border border-outline shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-low/50">
              <tr className="border-b border-outline">
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Winner Profile</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Draw Date</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Match Type</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Total Prize</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Proof</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Verification</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Payment</th>
                <th className="text-right px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : winners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-surface-low border border-outline border-dashed flex items-center justify-center mx-auto mb-4">
                      <Award className="text-text-dim opacity-50" size={24} />
                    </div>
                    <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold text-text mb-1">No Winners Yet</h3>
                    <p className="text-text-muted text-sm">Simulate a draw or run one manually to see entries here.</p>
                  </td>
                </tr>
              ) : (
                winners.map((w) => (
                  <tr key={w.id} className="border-b border-outline hover:bg-surface-base transition-colors duration-200">
                    <td className="px-6 py-5">
                      <div className="font-bold text-sm text-text font-[family-name:var(--font-heading)]">{w.profiles?.full_name || 'Unknown User'}</div>
                      <div className="text-xs text-text-muted">{w.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-text-dim">
                      {w.draws ? formatDate(w.draws.draw_date) : '—'}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-gold-light text-gold-deep border border-gold/20">
                        {w.match_type || `${w.matched_count} Matches`}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-lg text-gold-deep font-[family-name:var(--font-heading)]">
                      {formatCurrency(Number(w.prize_amount))}
                    </td>
                    <td className="px-6 py-5">
                      {w.proof_image_url ? (
                        <a 
                          href={w.proof_image_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-low border border-outline text-[10px] font-bold text-text-dim hover:bg-white hover:text-gold-deep hover:border-gold/40 transition-all"
                        >
                          <ImageIcon size={12} />
                          View Proof
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="text-[10px] text-text-muted italic flex items-center gap-1">
                          <Clock size={10} /> No proof yet
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        w.verification_status === 'approved' ? 'bg-green-mist text-green-dark border-green/20' :
                        w.verification_status === 'rejected' ? 'bg-error-light text-error border-error/20' : 
                        w.verification_status === 'pending' ? 'bg-gold-light text-gold-deep border-gold/20' :
                        'bg-surface-mid text-text-muted border-outline'
                      }`}>
                        {w.verification_status || 'waiting'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                        w.payment_status === 'paid' ? 'bg-green-mist text-green-dark border-green/20' : 'bg-surface-mid text-text-muted border-outline'
                      }`}>
                        {w.payment_status || 'unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {w.verification_status !== 'approved' && (
                          <button onClick={() => updateVerification(w.id, 'approved')} className="p-2 rounded-xl bg-surface-low border border-outline hover:bg-green-mist hover:text-green-dark hover:border-green/20 transition-all text-text-muted group" title="Approve">
                            <CheckCircle size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                        {w.verification_status !== 'rejected' && (
                          <button onClick={() => updateVerification(w.id, 'rejected')} className="p-2 rounded-xl bg-surface-low border border-outline hover:bg-error-light hover:text-error hover:border-error/20 transition-all text-text-muted group" title="Reject">
                            <XCircle size={16} className="group-hover:scale-110 transition-transform" />
                          </button>
                        )}
                        {w.payment_status !== 'paid' && w.verification_status === 'approved' && (
                          <button onClick={() => markPaid(w.id)} className="text-xs px-4 py-2 rounded-xl bg-white border border-gold/40 text-gold-deep shadow-sm hover:bg-gold-light hover:border-gold/60 transition-all flex items-center gap-1.5 font-bold uppercase tracking-widest">
                            <DollarSign size={14} /> Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
