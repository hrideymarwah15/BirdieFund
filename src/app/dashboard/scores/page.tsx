'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'
import { Target, Plus, History, CheckCircle, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function getScoreCategory(score: number) {
  if (score >= 36) return { label: 'Excellent Round', color: 'text-green-dark', bg: 'bg-green-mist' }
  if (score >= 28) return { label: 'Good Round', color: 'text-green', bg: 'bg-green-50' }
  if (score >= 18) return { label: 'Average', color: 'text-gold-deep', bg: 'bg-gold-light' }
  return { label: 'Below Par', color: 'text-text-dim', bg: 'bg-surface-low' }
}

export default function ScoresPage() {
  const [scores, setScores] = useState<{ id: string; score: number; created_at: string; played_date: string }[]>([])
  const [newScore, setNewScore] = useState(28)
  const [playedDate, setPlayedDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()

  useEffect(() => {
    setPlayedDate(new Date().toISOString().split('T')[0])
    fetchScores()
  }, [])

  const handleRealtimeUpdate = useMemo(() => (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setScores(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setScores(prev => prev.map(s => s.id === payload.new.id ? payload.new : s))
    } else if (payload.eventType === 'DELETE') {
      setScores(prev => prev.filter(s => s.id !== payload.old.id))
    }
  }, [])

  useRealtimeSubscription('scores', handleRealtimeUpdate)

  const fetchScores = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setScores(data)
  }

  const submitScore = async () => {
    setLoading(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Rolling 5 logic: check existing scores
    const { data: existingScores } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', user.id)
      .order('played_date', { ascending: true }) // Oldest first

    if (existingScores && existingScores.length >= 5) {
      // Delete the oldest score
      const oldestId = existingScores[0].id
      await supabase.from('scores').delete().eq('id', oldestId)
    }

    const { error } = await supabase.from('scores').insert({
      user_id: user.id,
      score: newScore,
      played_date: new Date(playedDate).toISOString()
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Score submitted!')
      // Realtime listener will handle local list update
    }
    setLoading(false)
  }

  const category = useMemo(() => getScoreCategory(newScore), [newScore])
  const quickPicks = [18, 22, 26, 30, 34, 38, 42]
  const avgScore = useMemo(() => {
    if (scores.length === 0) return 0
    return Math.round(scores.slice(0, 5).reduce((a, s) => a + Number(s.score), 0) / Math.min(scores.length, 5))
  }, [scores])

  // Gradient intensity: newest = darkest green, oldest = lightest
  const getGradientBg = (i: number, total: number) => {
    if (i >= 5) return 'bg-surface-low'
    const intensity = 1 - (i / Math.min(total, 5))
    const alpha = Math.round(intensity * 15 + 5)
    return `bg-green-50`
  }

  return (
    <div>
      <div className="mb-8 pt-2">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-text tracking-tight">My Scores</h1>
        <p className="text-text-muted mt-1 text-sm">Enter your latest Stableford scores. Your 5 most recent become your draw entry.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Score Entry */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-outline p-6 sm:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green to-green-light rounded-t-2xl" />

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-mist flex items-center justify-center">
                <Plus size={20} className="text-green-dark" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text">Submit New Score</h2>
                <p className="text-text-dim text-xs">Stableford format (1–45 points)</p>
              </div>
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className={`rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2 ${
                    message.includes('submitted')
                      ? 'bg-green-mist text-green-dark'
                      : 'bg-error-light text-error'
                  }`}
                >
                  {message.includes('submitted') && <CheckCircle size={16} />}
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-center mb-2">
              <span className="text-7xl font-[family-name:var(--font-heading)] text-green-dark leading-none">{newScore}</span>
              <span className="text-text-dim text-lg ml-2">pts</span>
            </div>
            <div className="text-center mb-6">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${category.bg} ${category.color}`}>
                {category.label}
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={45}
              step={1}
              value={newScore}
              onChange={(e) => setNewScore(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer mb-4 accent-green"
              style={{
                background: `linear-gradient(to right, #16a34a 0%, #22c55e ${((newScore - 1) / 44) * 100}%, #e2e8e4 ${((newScore - 1) / 44) * 100}%)`
              }}
            />
            <div className="flex justify-between text-[10px] text-text-dim mb-8 px-0.5">
              <span>1</span><span>10</span><span>20</span><span>30</span><span>40</span><span>45</span>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-bold text-text-dim uppercase tracking-widest block mb-2 px-1">Round Date</label>
              <input
                type="date"
                value={playedDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setPlayedDate(e.target.value)}
                className="w-full bg-surface-low border border-outline rounded-xl px-4 py-2.5 text-sm font-medium text-text focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
              />
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] text-text-dim font-bold uppercase tracking-widest mr-1 self-center">Quick:</span>
              {quickPicks.map((q) => (
                <button
                  key={q}
                  onClick={() => setNewScore(q)}
                  className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all duration-150 ${
                    newScore === q
                      ? 'bg-green text-white shadow-sm shadow-green/20'
                      : 'border border-green/30 text-green-dark hover:bg-green hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            <button onClick={submitScore} disabled={loading} className="btn-primary w-full !py-3.5 disabled:opacity-50 text-sm">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              ) : (
                'Submit Score'
              )}
            </button>
          </div>
        </div>

        {/* Score History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-outline p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-deep to-gold-bright rounded-t-2xl" />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center">
                  <History size={20} className="text-gold-deep" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text">Score History</h2>
                  <p className="text-text-dim text-xs">Your rolling 5 scores</p>
                </div>
              </div>
              {avgScore > 0 && (
                <div className="bg-green-mist px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <TrendingUp size={14} className="text-green" />
                  <span className="text-xs font-bold text-green-dark">{avgScore} avg</span>
                </div>
              )}
            </div>

            {scores.length === 0 ? (
              <div className="text-center py-10">
                {/* SVG Golf Ball Empty State */}
                <svg viewBox="0 0 80 80" className="w-16 h-16 mx-auto mb-4 opacity-30">
                  <circle cx="40" cy="40" r="36" fill="none" stroke="#6b7c6e" strokeWidth="2" />
                  <circle cx="30" cy="30" r="2" fill="#6b7c6e" opacity="0.3" />
                  <circle cx="42" cy="28" r="2" fill="#6b7c6e" opacity="0.3" />
                  <circle cx="36" cy="38" r="2" fill="#6b7c6e" opacity="0.3" />
                  <circle cx="48" cy="36" r="2" fill="#6b7c6e" opacity="0.3" />
                  <circle cx="32" cy="46" r="2" fill="#6b7c6e" opacity="0.3" />
                  <circle cx="44" cy="44" r="2" fill="#6b7c6e" opacity="0.3" />
                </svg>
                <p className="text-sm text-text-dim">No scores yet. Submit your first round!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {scores.map((score, i) => (
                  <motion.div
                    key={score.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                    className={`flex items-center justify-between p-3 rounded-xl ${
                      i < 5 ? 'bg-green-50 border border-green-mist' : 'bg-surface-low'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center ${
                        i < 5 ? 'bg-green text-white' : 'bg-surface-highest text-text-dim'
                      }`} style={i < 5 ? { opacity: 1 - (i * 0.15) } : {}}>
                        {i + 1}
                      </span>
                      <span className="text-sm font-bold text-text">{score.score} pts</span>
                      {i < 5 && <span className={`text-[10px] font-bold ${getScoreCategory(score.score).color}`}>{getScoreCategory(score.score).label}</span>}
                    </div>
                    <span className="text-xs text-text-dim">
                      {new Date(score.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </motion.div>
                ))}

                {/* Rolling Average Line */}
                {avgScore > 0 && (
                  <div className="flex items-center gap-2 px-3 pt-2">
                    <div className="flex-1 h-[1px] bg-green/30" style={{ backgroundImage: 'repeating-linear-gradient(to right, #16a34a4d, #16a34a4d 4px, transparent 4px, transparent 8px)' }} />
                    <span className="text-[10px] font-bold text-green whitespace-nowrap">AVG: {avgScore}</span>
                    <div className="flex-1 h-[1px] bg-green/30" style={{ backgroundImage: 'repeating-linear-gradient(to right, #16a34a4d, #16a34a4d 4px, transparent 4px, transparent 8px)' }} />
                  </div>
                )}
              </div>
            )}

            {scores.length > 0 && (
              <div className="mt-4 pt-4 border-t border-outline">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-muted">Draw Entry Status</span>
                  <span className={`badge ${scores.length >= 5 ? 'badge-green' : 'badge-gold'}`}>
                    {scores.length >= 5 ? '✓ Entered' : `${5 - scores.length} more needed`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
