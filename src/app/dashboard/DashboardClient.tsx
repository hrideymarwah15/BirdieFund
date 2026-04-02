'use client'

import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Target, Trophy, Heart, Award, Calendar, TrendingUp, ChevronRight, Activity } from 'lucide-react'
import Link from 'next/link'
import { useRef, useMemo, useState } from 'react'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

interface DashboardClientProps {
  profile: any
  subscriptions: any[]
  scores: any[]
  nextDraw: any
  recentDraws: any[]
  totalWon: number
  winnerCount: number
}

/* ── Mini Score Chart (SVG Line Graph) ── */
function ScoreChart({ scores }: { scores: any[] }) {
  const chartRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(chartRef, { once: true })

  if (scores.length < 2) return null

  const reversed = [...scores].reverse()
  const maxScore = 45
  const minScore = 0
  const width = 400
  const height = 120
  const padding = { top: 10, bottom: 20, left: 10, right: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const points = reversed.map((s, i) => {
    const x = padding.left + (i / (reversed.length - 1)) * chartW
    const y = padding.top + chartH - ((Number(s.score) - minScore) / (maxScore - minScore)) * chartH
    return { x, y, score: s.score }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`

  const avg = Math.round(reversed.reduce((a, s) => a + Number(s.score), 0) / reversed.length)
  const avgY = padding.top + chartH - ((avg - minScore) / (maxScore - minScore)) * chartH

  return (
    <div ref={chartRef} className="mt-8 bg-white rounded-2xl border border-outline p-5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green to-green-light rounded-t-2xl" />
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-text font-[family-name:var(--font-heading)]">Score Trend</h3>
          <p className="text-xs text-text-dim">Last {reversed.length} rounds</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-green font-[family-name:var(--font-heading)]">{avg} avg</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Average reference line */}
        <line
          x1={padding.left} y1={avgY}
          x2={width - padding.right} y2={avgY}
          stroke="#16a34a"
          strokeDasharray="4 4"
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Gradient fill area */}
        <defs>
          <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#16a34a" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <motion.path
          d={areaD}
          fill="url(#scoreGrad)"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={isInView ? { pathLength: 1 } : {}}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Data points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="white"
            stroke="#16a34a"
            strokeWidth="2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.3, type: "spring" }}
          />
        ))}

        {/* Score labels */}
        {points.map((p, i) => (
          <text key={`label-${i}`} x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fill="#6b7c6e" fontWeight="600">
            {p.score}
          </text>
        ))}
      </svg>
    </div>
  )
}

export default function DashboardClient({
  profile: initialProfile,
  subscriptions: initialSubscriptions = [],
  scores: initialScores = [],
  nextDraw: initialNextDraw,
  recentDraws: initialRecentDraws = [],
  totalWon,
  winnerCount,
}: DashboardClientProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)
  const [scores, setScores] = useState(initialScores)
  const [nextDraw, setNextDraw] = useState(initialNextDraw)

  // Realtime Subscriptions
  const handleProfileUpdate = useMemo(() => (payload: any) => {
    if (payload.new && payload.new.id === profile?.id) {
      setProfile(payload.new)
    }
  }, [profile?.id])

  useRealtimeSubscription('profiles', handleProfileUpdate, `id=eq.${profile?.id}`)

  const handleSubscriptionUpdate = useMemo(() => (payload: any) => {
    if (payload.new && payload.new.user_id === profile?.id) {
      if (payload.eventType === 'INSERT') {
        setSubscriptions(prev => [...prev, payload.new])
      } else if (payload.eventType === 'UPDATE') {
        setSubscriptions(prev => prev.map(s => s.id === payload.new.id ? payload.new : s))
      } else if (payload.eventType === 'DELETE') {
        setSubscriptions(prev => prev.filter(s => s.id !== payload.old.id))
      }
    }
  }, [profile?.id])

  useRealtimeSubscription('subscriptions', handleSubscriptionUpdate, `user_id=eq.${profile?.id}`)

  const handleScoreUpdate = useMemo(() => (payload: any) => {
    if (payload.eventType === 'INSERT') {
      setScores(prev => [payload.new, ...prev].slice(0, 5))
    } else if (payload.eventType === 'UPDATE') {
      setScores(prev => prev.map(s => s.id === payload.new.id ? payload.new : s))
    } else if (payload.eventType === 'DELETE') {
      setScores(prev => prev.filter(s => s.id !== payload.old.id))
    }
  }, [])

  useRealtimeSubscription('scores', handleScoreUpdate, `user_id=eq.${profile?.id}`)

  const handleDrawUpdate = useMemo(() => (payload: any) => {
    if (payload.new && payload.new.status === 'pending') {
      setNextDraw(payload.new)
    }
  }, [])

  useRealtimeSubscription('draws', handleDrawUpdate)

  const containerRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const latestScores = scores || []
  const avgScore = latestScores.length
    ? Math.round(latestScores.reduce((a: number, s: any) => a + Number(s.score || 0), 0) / latestScores.length)
    : 0

  const getCountdown = () => {
    if (!nextDraw) return 'TBD'
    const diff = new Date(nextDraw.draw_date).getTime() - Date.now()
    if (diff <= 0) return 'Draw day!'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return `${days}d ${hours}h`
  }

  // Month cycle progress
  const dayOfMonth = new Date().getDate()
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100)

  const selectedCharity = profile?.charities
  const subStatus = profile?.subscription_status

  const cards = [
    {
      title: 'Active Entries',
      value: subscriptions.length > 0 ? `${subscriptions.length} ${subscriptions.length === 1 ? 'Entry' : 'Entries'}` : 'No Entries',
      subtitle: subscriptions.length > 0 ? `${subscriptions.filter(s => s.status === 'active').length} Active Memberships` : 'Subscribe for elite access',
      icon: TrendingUp,
      accent: subscriptions.length > 0 ? 'green' : 'gray',
      href: '/dashboard/settings',
      showPulse: subscriptions.length > 0,
    },
    {
      title: 'Average Score',
      value: avgScore ? `${avgScore} pts` : 'No scores',
      subtitle: `${latestScores.length}/5 scores entered`,
      icon: Target,
      accent: 'green',
      href: '/dashboard/scores',
    },
    {
      title: 'Total Winnings',
      value: `£${totalWon.toLocaleString()}`,
      subtitle: totalWon > 0 ? 'Lifetime earnings' : 'Keep playing!',
      icon: Award,
      accent: 'gold',
      href: '/dashboard/winnings',
    },
    {
      title: 'Next Draw',
      value: getCountdown(),
      subtitle: nextDraw ? new Date(nextDraw.draw_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }) : 'Next month',
      icon: Calendar,
      accent: 'gold',
      href: '/dashboard/draws',
    },
    {
      title: 'My Charities',
      value: subscriptions.length > 0 
        ? (subscriptions[0].charities?.name || 'Multiple') 
        : 'None selected',
      subtitle: subscriptions.length > 1 
        ? `Supporting ${subscriptions.length} causes` 
        : subscriptions.length === 1 ? 'Supporting a cause' : 'Choose a cause',
      icon: Heart,
      accent: 'green',
      href: '/dashboard/charity',
    },
    {
      title: 'Draw Entries',
      value: latestScores.length >= 5 ? 'Entered' : 'Not ready',
      subtitle: latestScores.length >= 5 ? 'Your 5 scores are in' : `Need ${5 - latestScores.length} more scores`,
      icon: Trophy,
      accent: latestScores.length >= 5 ? 'green' : 'gray',
      href: '/dashboard/scores',
    },
  ]

  return (
    <div ref={containerRef} className="relative min-h-[120vh]">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-mist opacity-30 blur-[120px] rounded-full translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-gold/10 blur-[100px] rounded-full opacity-40" />
        
        {/* Luxury Grain/Noise Texture */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }} />

        {/* Abstract Golf Shapes (SVG) */}
        <svg className="absolute top-1/2 left-0 -translate-x-1/2 opacity-5" width="400" height="400" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" strokeWidth="0.5" />
          <path d="M50 10 L50 90 M10 50 L90 50" stroke="#16a34a" strokeWidth="0.2" />
        </svg>
        <svg className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 opacity-[0.08]" width="600" height="600" viewBox="0 0 100 100">
          <path d="M0 100 Q 25 25 50 100 T 100 100" fill="none" stroke="#16a34a" strokeWidth="0.5" />
          <circle cx="50" cy="70" r="2" fill="#16a34a" />
        </svg>
      </div>

      <motion.div style={{ y, opacity }} className="mb-10 pt-4 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-outline shadow-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-green pulsing-dot" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Dashboard</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-heading)] text-text tracking-tight">
          Welcome back,<br />
          <span className="text-green italic">{profile?.full_name || 'Golfer'}</span> 👋
        </h1>
        <p className="text-text-muted mt-3 text-lg max-w-xl leading-relaxed">
          Track your performance and see the impact you&apos;re making.
        </p>
      </motion.div>

      {/* Subscribe CTA (if not active) */}
      {(subStatus !== 'active' && subscriptions.length === 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-10 bg-gradient-to-br from-green-dark to-green p-8 rounded-3xl text-white shadow-xl shadow-green/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] mb-2">Activate Your Membership</h2>
              <p className="text-white/80 max-w-lg text-sm leading-relaxed">Join the club to enter monthly draws, track unlimited scores, and automatically support charities.</p>
            </div>
            <Link href="/dashboard/settings" className="bg-white text-green font-bold px-8 py-3.5 rounded-xl hover:bg-gold hover:text-text hover:-translate-y-1 transition-all shadow-lg whitespace-nowrap">
              Subscribe Now
            </Link>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={card.href} className="block group">
              <div className="bg-white border border-outline shadow-sm p-6 rounded-2xl h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden">
                {/* Top accent gradient */}
                <div className={`absolute top-0 left-0 w-full h-[3px] rounded-t-2xl ${
                  card.accent === 'green' ? 'bg-gradient-to-r from-green to-green-light'
                  : card.accent === 'gold' ? 'bg-gradient-to-r from-gold-deep to-gold-bright'
                  : 'bg-gradient-to-r from-surface-mid to-surface-high'
                }`} />

                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    card.accent === 'green' ? 'bg-green-mist'
                    : card.accent === 'gold' ? 'bg-gold-light'
                    : 'bg-surface-low'
                  }`}>
                    <card.icon size={22} strokeWidth={1.5} className={
                      card.accent === 'green' ? 'text-green-dark'
                      : card.accent === 'gold' ? 'text-gold-deep'
                      : 'text-text-dim'
                    } />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {card.showPulse && (
                      <div className="w-2 h-2 rounded-full bg-green pulsing-dot" />
                    )}
                    <ChevronRight size={14} className="text-text-dim opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-xs font-bold text-text-dim uppercase tracking-wider label-caps">{card.title}</span>
                <div className="mt-1.5 text-xl font-bold font-[family-name:var(--font-heading)] text-text">
                  {card.value}
                </div>
                <p className="text-text-muted text-xs mt-1">{card.subtitle}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Score Performance Chart */}
      <ScoreChart scores={latestScores} />

      {/* Month Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-6 bg-white rounded-2xl border border-outline p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-gold-deep" />
            <span className="text-sm font-bold text-text font-[family-name:var(--font-heading)]">Month Cycle</span>
          </div>
          <span className="text-xs text-text-dim font-bold">{monthProgress}% complete</span>
        </div>
        <div className="w-full h-2 bg-surface-low rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${monthProgress}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.8 }}
            className="h-full bg-gradient-to-r from-green to-green-light rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-text-dim uppercase tracking-wider">
          <span>Month Start</span>
          <span>Draw Day</span>
        </div>
      </motion.div>

      {/* Activity Footer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-6 bg-white border border-outline rounded-2xl p-6 text-center"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 bg-green-mist rounded-full mb-3">
          <Activity size={22} className="text-green" />
        </div>
        <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text mb-1">Recent Activity</h3>
        <p className="text-text-muted text-sm max-w-sm mx-auto">
          {latestScores.length > 0
            ? `You've submitted ${latestScores.length} scores recently. Keep it up to ensure your place in the draw!`
            : "You haven't submitted any scores yet. Head over to the scores page to log your first round."}
        </p>
      </motion.div>
    </div>
  )
}
