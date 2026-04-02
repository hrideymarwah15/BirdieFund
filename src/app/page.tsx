'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion'
import { Target, Trophy, Heart, ArrowRight, Star, Users, Calendar, TrendingUp, Shield, Zap, CheckCircle, ChevronRight, Award as AwardIcon, Quote, DollarSign, History as HistoryIcon } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/* ── Animation Variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

const heroImages = [
  "/hero-sunrise-4k.png",
  "/hero-ball-branded.png",
  "/hero_golfer_swing_1775018390201.png",
  "/hero-coastal-4k.png",
]

/* ── Animated Counter Hook ── */
function useAnimatedCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [isInView, target, duration])

  return { count, ref }
}

function AnimatedStat({ value, label, prefix = '', suffix = '', icon: Icon }: {
  value: number; label: string; prefix?: string; suffix?: string; icon: React.ElementType
}) {
  const { count, ref } = useAnimatedCounter(value, 2200)
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeUp}
      className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden"
      style={{ background: 'radial-gradient(circle at top left, rgba(34,197,94,0.08), transparent)' }}
    >
      <Icon size={20} className="text-green-light mx-auto mb-3" />
      <div className="text-3xl sm:text-4xl font-bold font-[family-name:var(--font-heading)] text-white mb-1">
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div className="w-8 h-[2px] bg-green-light/40 mx-auto mb-2 rounded-full" />
      <div className="text-white/50 text-xs uppercase tracking-wider label-caps">{label}</div>
    </motion.div>
  )
}

export default function LandingPage() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      } else {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const onScroll = () => setShowStickyCTA(window.scrollY > 300)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-[#052e16] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-green-light border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <>
      <Navbar />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-end overflow-hidden">
        {/* Background Image Slider */}
        <div className="absolute inset-0 z-0 bg-[#052e16]">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={heroImages[currentImageIndex]}
                alt="BirdieFund Championship Golf"
                fill
                className="object-cover object-center"
                priority={currentImageIndex === 0}
                quality={95}
              />
            </motion.div>
          </AnimatePresence>
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#052e16]/95 via-[#052e16]/50 to-[#052e16]/30 z-10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#052e16]/80 via-transparent to-transparent z-10 pointer-events-none" />
          {/* Noise texture */}
          <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-6 pb-20 pt-40 w-full">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-8"
            >
              <div className="w-2 h-2 rounded-full bg-green-light pulsing-dot" />
              <span className="text-white/90 text-sm font-medium">£50K+ raised for charities worldwide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-[family-name:var(--font-heading)] tracking-tight leading-[1.05] mb-6 text-white"
            >
              Your Game.{' '}
              <br className="hidden sm:block" />
              <span className="text-shimmer-green">Real Prizes.</span>{' '}
              <br className="hidden sm:block" />
              Real Impact.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg sm:text-xl text-white/70 max-w-xl mb-10 leading-relaxed"
            >
              Enter your Stableford scores, compete in monthly prize draws,
              and fund the charities you believe in — all from one subscription.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link href="/signup" className="btn-primary-lg flex items-center gap-2.5 group shadow-lg shadow-green/25">
                Start Playing for Free
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="#how-it-works" className="btn-white flex items-center gap-2 !py-4 !px-6">
                See How It Works
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          </div>

          {/* Frosted stat bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="frosted-strip rounded-2xl px-6 py-4 flex flex-wrap gap-6 mt-16 items-center"
          >
            {[
              { icon: Users, value: '2,500+', label: 'Active Members' },
              { icon: Trophy, value: '12', label: 'Monthly Draws' },
              { icon: Heart, value: '£50K+', label: 'To Charity' },
              { icon: DollarSign, value: '£15K', label: 'Live Prize Pool' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <stat.icon size={16} className="text-green-light" />
                <div>
                  <span className="text-white font-bold text-sm">{stat.value}</span>
                  <span className="text-white/50 text-xs ml-1.5">{stat.label}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </section>

      {/* ═══════════════ SOCIAL PROOF BAR ═══════════════ */}
      <section className="bg-green-deep py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-white/70 text-sm">
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-light" /> Trusted by 2,500+ golfers</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-light" /> 6 charity partners</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-light" /> Verified fair draws</span>
            <span className="flex items-center gap-2"><CheckCircle size={14} className="text-green-light" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ═══════════════ THE ELITE ENGINE (PRD RULES) ═══════════════ */}
      <section id="engine" className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/10 text-green-dark font-bold text-sm tracking-widest uppercase mb-8 border border-green/20"
              >
                <Zap size={14} fill="currentColor" />
                The Elite Engine
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-text mb-8">
                Precision Rules for <br />
                <span className="text-shimmer-green">Premium Stakes</span>.
              </h2>
              <p className="text-text-muted text-lg mb-10 leading-relaxed">
                Our draw engine follows strict PRD-audited logic to ensure transparency, fairness, and maximum impact for both players and charities.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-green-mist flex items-center justify-center">
                    <HistoryIcon size={24} className="text-green-dark" />
                  </div>
                  <h4 className="font-bold text-text">Rolling 5 Logic</h4>
                  <p className="text-sm text-text-dim leading-relaxed">
                    Only your latest 5 rounds count. A new score automatically replaces the oldest round, keeping the draw dynamic and current.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-gold-light flex items-center justify-center">
                    <AwardIcon size={24} className="text-gold-deep" />
                  </div>
                  <h4 className="font-bold text-text">Prize Split (40/35/25)</h4>
                  <p className="text-sm text-text-dim leading-relaxed">
                    40% directly to Charity, 35% to the Monthly Jackpot, and 25% to the Draw Winner. Every round matters.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 relative">
              <div className="bg-surface-low rounded-3xl p-8 border border-outline shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green flex items-center justify-center shadow-lg shadow-green/20">
                      <Shield size={20} className="text-white" />
                    </div>
                    <span className="font-bold text-text">Verified Draw Logs</span>
                  </div>
                  <span className="text-xs font-bold text-green uppercase tracking-widest">Live Engine</span>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: 'Winner Verification', status: 'Active', color: 'text-green' },
                    { label: 'Prize Distribution', status: 'Audited', color: 'text-blue-600' },
                    { label: 'Charity Payouts', status: 'Direct', color: 'text-gold-deep' }
                  ].map((log) => (
                    <div key={log.label} className="p-4 rounded-2xl bg-white border border-outline flex items-center justify-between group-hover:border-green/30 transition-colors">
                      <span className="text-sm font-medium text-text-secondary">{log.label}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-surface ${log.color}`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-outline flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-dark">100%</div>
                    <div className="text-[10px] font-bold text-text-dim uppercase tracking-[3px]">PRD Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="py-24 sm:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-green text-sm font-bold uppercase tracking-widest mb-3 label-caps">
              Simple & Rewarding
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-text">
              How BirdieFund Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted mt-4 max-w-xl mx-auto">
              Three simple steps to start winning prizes and supporting charities you care about.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-1/2 left-[16.67%] right-[16.67%] h-[2px] -translate-y-1/2 z-0">
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
                className="h-full bg-gradient-to-r from-green via-gold to-green origin-left rounded-full"
              />
            </div>

            {[
              { icon: Target, step: '01', title: 'Enter Your Scores', desc: 'Submit your latest 5 Stableford golf scores. They become your unique draw entry numbers for the month.', accent: 'green' },
              { icon: Trophy, step: '02', title: 'Monthly Prize Draw', desc: 'Every month, winning numbers are drawn. Match 3, 4, or all 5 to claim your share of the growing prize pool.', accent: 'gold' },
              { icon: Heart, step: '03', title: 'Fund Your Charity', desc: 'Choose a charity close to your heart. At least 10% of every subscription goes directly to them, transparently.', accent: 'green' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`card-elevated p-8 relative group z-10 ${
                  item.accent === 'gold' ? 'shadow-[0_0_24px_rgba(202,138,4,0.15)]' : ''
                }`}
              >
                <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
                  item.accent === 'green'
                    ? 'bg-gradient-to-r from-green to-green-light'
                    : 'bg-gradient-to-r from-gold-deep to-gold-bright'
                }`} />

                <div className="text-surface-highest font-[family-name:var(--font-heading)] text-7xl absolute top-4 right-6 select-none opacity-60">
                  {item.step}
                </div>

                <div className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center mb-6 ${
                  item.accent === 'green' ? 'bg-green-mist' : 'bg-gold-light'
                }`}>
                  <item.icon size={22} className={item.accent === 'green' ? 'text-green-dark' : 'text-gold-deep'} />
                </div>

                <h3 className="text-xl font-[family-name:var(--font-heading)] mb-3 text-text">{item.title}</h3>
                <p className="text-text-muted text-[0.9rem] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURE GRID ═══════════════ */}
      <section className="py-24 section-light relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-gold-deep text-sm font-bold uppercase tracking-widest mb-3 label-caps">
              Built for Golfers
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-text">
              Why Golfers Love BirdieFund
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, title: 'Performance Tracking', desc: 'Monitor your Stableford scores over time with clear progress visualizations.' },
              { icon: Shield, title: 'Verified & Transparent', desc: 'Every draw is independently verified. Every winner is confirmed. No exceptions.' },
              { icon: Zap, title: 'Instant Notifications', desc: 'Receive real-time draw results and instant alerts the moment you win a prize.' },
              { icon: Users, title: 'Growing Community', desc: 'Join thousands of golfers who play not just for themselves, but for something bigger.' },
              { icon: Calendar, title: 'Monthly Draws', desc: 'Fresh draws every month with multi-tier prizes and jackpots that roll over.' },
              { icon: Heart, title: 'Transparent Impact', desc: 'Full visibility into where your charity contributions go. Real receipts. Real impact.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="card-elevated p-6 bg-white group border border-[rgba(22,163,74,0.12)] hover:border-[rgba(22,163,74,0.5)]"
              >
                <div className="w-[44px] h-[44px] rounded-xl bg-green-mist flex items-center justify-center mb-4 group-hover:bg-green-50 transition-colors">
                  <item.icon size={22} className="text-green-dark" />
                </div>
                <h3 className="text-lg font-[family-name:var(--font-heading)] mb-2 text-text">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ IMPACT BANNER ═══════════════ */}
      <section className="section-green py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/5 translate-y-1/2 -translate-x-1/3" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-green-light text-sm font-bold uppercase tracking-widest mb-4 label-caps">
                Real Impact, Real Numbers
              </p>
              <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-white mb-6">
                Every Subscription
                <br />Makes a Difference
              </h2>
              <p className="text-white/70 leading-relaxed mb-8 max-w-lg">
                BirdieFund isn&apos;t just about winning. It&apos;s about building a community of golfers
                who believe their game can change lives. Here&apos;s the proof.
              </p>
              <Link href="/signup" className="btn-white inline-flex items-center gap-2 group">
                Join the Movement
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <AnimatedStat value={50} prefix="£" suffix="K+" label="Donated to Charity" icon={Heart} />
              <AnimatedStat value={2500} suffix="+" label="Active Members" icon={Users} />
              <AnimatedStat value={36} label="Draws Completed" icon={Trophy} />
              <AnimatedStat value={120} prefix="£" suffix="K" label="Prizes Awarded" icon={AwardIcon} />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ CHARITY SPOTLIGHT (MISSION) ═══════════════ */}
      <section id="charity-mission" className="py-24 sm:py-32 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] sm:aspect-[16/10] rounded-3xl overflow-hidden group shadow-2xl"
            >
              <Image 
                src="/charity-celebration.png" 
                alt="Elite Charity Gala" 
                fill 
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-green-deep/80 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 text-white">
                <div className="text-gold-light font-bold text-sm uppercase tracking-widest mb-2">Social Impact</div>
                <h3 className="text-2xl font-[family-name:var(--font-heading)] font-bold mb-1">Our Collective Impact</h3>
                <p className="text-white/80 text-sm">Over £120,000 awarded and donated through member rounds.</p>
              </div>
            </motion.div>
            
            <div className="flex flex-col">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold-deep font-bold text-sm tracking-widest uppercase mb-8 border border-gold/20 mr-auto"
              >
                <Heart size={14} className="fill-current" />
                Emotion-Driven Impact
              </motion.div>
              <h2 className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-text mb-8">
                Not Just a Game. <br />
                <span className="text-green">A Legacy of Giving</span>.
              </h2>
              <p className="text-text-muted text-lg mb-10 max-w-xl">
                BirdieFund Elite turns every swing into a step forward for global charities. We believe the competitive spirit of golf is the perfect catalyst for massive social change.
              </p>
              
              <Link href="/charities" className="btn-primary inline-flex items-center gap-3 w-fit group">
                Browse Charity Partners
                <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section id="charities" className="py-24 sm:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-green text-sm font-bold uppercase tracking-widest mb-3 label-caps">
              Our Partners
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-text mb-4">
              Charities We Support
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted max-w-xl mx-auto">
              Choose a cause close to your heart. Every subscription makes a measurable difference.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'The First Tee', desc: 'Empowering young people through golf, building character and life skills for the next generation.', color: '#16a34a' },
              { name: 'Golf For Africa', desc: 'Providing clean water, education, and sustainable resources to communities across Africa.', color: '#166534' },
              { name: 'On Course Foundation', desc: 'Harnessing the power of golf to support the recovery of wounded military veterans.', color: '#052e16' },
              { name: 'Youth on Course', desc: 'Making golf affordable and accessible for young people everywhere, opening doors through sport.', color: '#22c55e' },
              { name: 'Folds of Honor', desc: 'Providing life-changing educational scholarships to families of America\'s fallen service members.', color: '#ca8a04' },
              { name: 'Birdies for the Brave', desc: 'Supporting military families through golf experiences, healing, and community connections.', color: '#166534' },
            ].map((charity, i) => (
              <motion.div
                key={charity.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className="card-elevated p-6 flex flex-col"
              >
                <div className="w-full h-28 rounded-xl mb-5 flex items-center justify-center" style={{
                  background: `linear-gradient(135deg, ${charity.color}12, ${charity.color}06)`
                }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-[family-name:var(--font-heading)] text-xl" style={{ background: charity.color }}>
                    {charity.name.charAt(0)}
                  </div>
                </div>
                <h3 className="text-lg font-[family-name:var(--font-heading)] mb-2 text-text">{charity.name}</h3>
                <p className="text-text-muted text-sm leading-relaxed flex-1">{charity.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ PRICING ═══════════════ */}
      <section id="pricing" className="py-24 sm:py-32 section-light">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-gold-deep text-sm font-bold uppercase tracking-widest mb-3 label-caps">
              Membership
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-text mb-4">
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-text-muted max-w-xl mx-auto">
              One subscription. Unlimited draws. Real charity impact. No hidden fees.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Monthly */}
            <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.6 }}
              className="card-elevated p-8 bg-white"
            >
              <div className="badge-green mb-4">Monthly</div>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-5xl font-[family-name:var(--font-heading)] text-text">£9.99</span>
                <span className="text-text-muted mb-1 text-sm">/month</span>
              </div>
              <p className="text-text-muted text-sm mb-8">Cancel anytime. No commitment.</p>
              <ul className="space-y-3 mb-8">
                {['Monthly prize draw entry', 'Track 5 rolling scores', 'Choose your charity', 'Full dashboard access', 'Winner verification'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-text-secondary">
                    <CheckCircle size={16} className="text-green flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-secondary w-full text-center block">
                Get Started
              </Link>
            </motion.div>

            {/* Yearly — gradient border */}
            <motion.div initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
              className="relative p-[2px] rounded-[18px]"
              style={{ background: 'linear-gradient(135deg, #16a34a, #ca8a04, #16a34a)' }}
            >
              <div className="bg-white rounded-[16px] p-8 relative">
                <div className="absolute -top-3.5 right-6 bg-gold text-white text-xs font-bold px-3 py-1 rounded-full">Save 17%</div>
                <div className="badge-gold mb-4">Yearly — Best Value</div>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-[family-name:var(--font-heading)] text-gradient-green">£99.99</span>
                  <span className="text-text-muted mb-1 text-sm">/year</span>
                </div>
                <p className="text-text-muted text-sm mb-8">Best value. Save over £19 per year.</p>
                <ul className="space-y-3 mb-8">
                  {['Everything in Monthly', 'Priority draw entry', 'Exclusive yearly badge', 'Early results access', 'Bigger charity impact'].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-text-secondary">
                      <CheckCircle size={16} className="text-gold-deep flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className="btn-primary w-full text-center block">
                  Get Started — Best Value
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-24 sm:py-32 bg-surface">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} custom={0} className="text-green text-sm font-bold uppercase tracking-widest mb-3 label-caps">
              Member Stories
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl sm:text-5xl font-[family-name:var(--font-heading)] tracking-tight text-text mb-4">
              What Golfers Say
            </motion.h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'James Mitchell',
                handicap: '14 HCP',
                quote: "BirdieFund genuinely makes me excited to submit my scores. Knowing I'm also helping The First Tee makes every round meaningful.",
                initial: 'JM',
                color: '#16a34a',
              },
              {
                name: 'Sarah Thornton',
                handicap: '22 HCP',
                quote: "Won £250 last month and didn't even realise until the notification popped up. The whole experience feels premium and effortless.",
                initial: 'ST',
                color: '#ca8a04',
              },
              {
                name: 'David Park',
                handicap: '8 HCP',
                quote: "I've tried other golf apps but none combine competition with charity so elegantly. The transparency is what sold me.",
                initial: 'DP',
                color: '#166534',
              },
            ].map((testimonial, i) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className="card-elevated p-8 bg-white relative"
              >
                <div className="absolute top-6 right-6 opacity-10">
                  <Quote size={40} className="text-green" />
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: testimonial.color }}>
                    {testimonial.initial}
                  </div>
                  <div>
                    <div className="font-bold text-text text-sm">{testimonial.name}</div>
                    <div className="text-text-dim text-xs">{testimonial.handicap}</div>
                  </div>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-24 sm:py-32 bg-surface relative overflow-hidden">
        {/* Elite Backdrop */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/hero-sunrise-4k.png" 
            alt="Elite Golf Sunrise" 
            fill 
            className="object-cover opacity-10 grayscale-[0.2] brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white/80 to-white" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green/10 text-green-deep font-bold text-sm tracking-widest uppercase mb-8 border border-green/20"
          >
            <Trophy size={14} />
            The Next Draw is Calling
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-[family-name:var(--font-heading)] tracking-tight text-text mb-6"
          >
            Ready to Make Every{' '}
            <span className="text-shimmer-green">Round Count</span>?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-xl mb-10 max-w-xl mx-auto"
          >
            Join thousands of premier golfers who play for high-stakes prizes and empower elite charities with every swing.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
          >
            <Link href="/signup" className="btn-primary-lg inline-flex items-center gap-3 group shadow-2xl shadow-green/30 px-10 py-5 text-lg">
              Unlock Elite Membership
              <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ FLOATING STICKY CTA ═══════════════ */}
      <AnimatePresence>
        {showStickyCTA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <Link
              href="/signup"
              className="flex items-center gap-3 bg-green-deep text-white px-6 py-3.5 rounded-full shadow-2xl shadow-green-deep/40 hover:shadow-green-deep/60 transition-all hover:-translate-y-0.5 border border-green/30"
            >
              <div className="w-2 h-2 rounded-full bg-green-light pulsing-dot" />
              <span className="font-bold text-sm">Join BirdieFund</span>
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </>
  )
}
