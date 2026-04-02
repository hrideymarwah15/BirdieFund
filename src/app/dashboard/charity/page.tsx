'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Heart, Search, CheckCircle, Award, Globe, Plus, ShieldCheck, Sparkles, Wallet, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'

export default function CharityPage() {
  const [charities, setCharities] = useState<{ id: string; name: string; description: string; is_featured: boolean }[]>([])
  const [search, setSearch] = useState('')
  const [contribution, setContribution] = useState(10)
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [donationAmount, setDonationAmount] = useState('50')
  const [isDonating, setIsDonating] = useState(false)
  const [donationSuccess, setDonationSuccess] = useState(false)
  
  const supabase = createClient()
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCharities()
    fetchCurrent()
    
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchCharities = async () => {
    const { data } = await supabase
      .from('charities')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
    if (data) setCharities(data)
  }

  const fetchCurrent = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('profiles')
      .select('selected_charity_id, charity_contribution_pct')
      .eq('id', user.id)
      .single()
    
    if (data) {
      setSelected(data.selected_charity_id)
      setContribution(data.charity_contribution_pct || 10)
    }
  }

  const saveCharity = async () => {
    setIsSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !selected) {
      setIsSaving(false)
      return
    }
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800))

    const { error } = await supabase
      .from('profiles')
      .update({
        selected_charity_id: selected,
        charity_contribution_pct: contribution,
      })
      .eq('id', user.id)
    
    setIsSaving(false)
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Impact commitment updated. Thank you for your generosity!')
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const seedSampleCharities = async () => {
    const samples = [
      { name: 'The First Tee', description: 'Impacting the lives of young people by providing educational programs that build character through the game of golf.', is_active: true, is_featured: true },
      { name: 'Golf Foundation', description: 'Changing lives through golf. Introducing children from all backgrounds to the sport, creating golfers for life.', is_active: true, is_featured: true },
      { name: 'Macmillan Cancer Support', description: 'Providing physical, financial and emotional support to help people live life as fully as they can with cancer.', is_active: true, is_featured: false },
      { name: 'Make-A-Wish UK', description: 'Transforming the lives of children with critical illnesses by granting their One True Wish.', is_active: true, is_featured: false },
      { name: 'Mind', description: 'Providing advice and support to empower anyone experiencing a mental health problem.', is_active: true, is_featured: false },
      { name: 'WaterAid Scotland', description: 'Transforming lives by providing clean water, decent toilets and good hygiene to those in need.', is_active: true, is_featured: false },
      { name: 'Golfers Against Cancer', description: 'Raising money for cancer research through tournaments and charitable giving.', is_active: true, is_featured: true },
      { name: 'Green Grass Initiative', description: 'Dedicated to environmental sustainability in golf, preserving courses and local wildlife habitats.', is_active: true, is_featured: false },
      { name: 'Fairway Equality', description: 'Promoting diversity and inclusion within the golf community, ensuring the sport is accessible to all.', is_active: true, is_featured: true },
      { name: 'The R&A Foundation', description: 'Supporting the growth of golf globally through coaching, education, and facility development.', is_active: true, is_featured: false }
    ]
    
    for (const charity of samples) {
      await supabase.from('charities').upsert(charity, { onConflict: 'name' })
    }
    
    fetchCharities()
    setMessage('Sample charities refreshed!')
    setTimeout(() => setMessage(''), 3000)
  }
  
  const handleDirectDonation = async () => {
    setIsDonating(true)
    // Simulate API call
    await new Promise(r => setTimeout(r, 1500))
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#fbbf24', '#ffffff']
    })
    setDonationSuccess(true)
    setIsDonating(false)
    setTimeout(() => setDonationSuccess(false), 5000)
  }

  const filtered = search === '' 
    ? charities.slice(0, 5) 
    : charities.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.description.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 5)

  const selectedCharity = charities.find(c => c.id === selected)

  // Simulation: £10 standard entry fee. The math shown is for visualization.
  const entryFee = 10;
  const contributionValue = (entryFee * (contribution / 100)).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      {/* Background flare */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-mist opacity-30 blur-[100px] rounded-full pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
    
      <div className="mb-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-outline shadow-sm mb-4">
          <Heart size={14} className="text-green pulsing-dot" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Impact Center</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-heading)] text-text tracking-tight">Your Chosen Cause</h1>
        <p className="text-text-muted mt-3 text-lg max-w-2xl leading-relaxed">Direct a portion of your BirdieFund subscription to a charity of your choice, automatically every month.</p>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-dark text-white rounded-2xl p-5 mb-8 shadow-xl shadow-green-dark/20 flex items-center gap-3 font-medium border border-green"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <CheckCircle size={18} className="text-gold" />
            </div>
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        
        {/* Main Selection Area */}
        <div className="space-y-8 h-full flex flex-col">
          
          {/* Intelligent Autocomplete Combobox */}
          <div className="relative z-20" ref={searchRef}>
            <label className="block text-[10px] font-bold text-text-muted mb-2 uppercase tracking-widest pl-1">
              Find a Charity
            </label>
            <div className={`relative flex items-center bg-white border ${isOpen ? 'border-green ring-4 ring-green/10' : 'border-outline'} rounded-2xl transition-all shadow-sm group`}>
              <Search size={20} className="absolute left-5 text-text-dim group-focus-within:text-green transition-colors" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setIsOpen(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && filtered.length > 0) {
                      setSelected(filtered[0].id)
                      setSearch(filtered[0].name)
                      setIsOpen(false)
                    }
                  }}
                  onFocus={() => setIsOpen(true)}
                  className="w-full bg-transparent border-none py-4 pl-14 pr-10 text-text placeholder:text-text-dim focus:outline-none focus:ring-0 rounded-2xl font-medium"
                  placeholder="Type to find your cause (e.g. 'Cancer', 'Water')..."
                />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-4 text-text-dim hover:text-text">
                  <span className="sr-only">Clear</span>
                  &times;
                </button>
              )}
            </div>

            {/* Dropdown Suggestions */}
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl shadow-green/5 border border-outline overflow-hidden z-30 max-h-96 overflow-y-auto"
                >
                  {filtered.length > 0 ? (
                    filtered.map((charity) => (
                      <button
                        key={charity.id}
                        onClick={() => {
                          setSelected(charity.id)
                          setSearch(charity.name)
                          setIsOpen(false)
                        }}
                        className={`w-full text-left p-5 border-b border-outline/30 hover:bg-surface-low transition-colors group flex items-start gap-4 ${selected === charity.id ? 'bg-green-mist/30' : ''}`}
                      >
                        <div className={`mt-0.5 min-w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selected === charity.id ? 'border-green bg-green text-white shadow-md shadow-green/30' : 'border-outline group-hover:border-green/50'}`}>
                          {selected === charity.id && <CheckCircle size={14} />}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-text font-[family-name:var(--font-heading)] flex items-center gap-2">
                            {charity.name}
                            {charity.is_featured && <span className="bg-gold-light text-gold-deep text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"><Award size={10} /> Partner</span>}
                          </div>
                          <p className="text-sm text-text-muted mt-1.5 leading-relaxed">{charity.description}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-12 text-center text-text-muted">
                      <Search size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="font-medium text-text">No charities found matching "{search}"</p>
                      <p className="text-sm">Try a different search term.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active Selection Showcase */}
          {selectedCharity ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-3xl p-8 sm:p-10 border border-green shadow-xl shadow-green/5 relative overflow-hidden flex-1"
            >
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-green to-green-light rounded-t-3xl" />
              <div className="absolute top-0 right-0 p-8 pt-10">
                <Heart className="w-32 h-32 text-green-mist opacity-40 transform rotate-12 -translate-y-4" />
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 bg-green-mist text-green-dark text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 border border-green/20">
                  <CheckCircle size={12} /> Currently Supporting
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-[family-name:var(--font-heading)] text-text mb-4 lg:pr-32 leading-tight">
                  {selectedCharity.name}
                </h2>
                
                <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-xl mb-8">
                  {selectedCharity.description}
                </p>
                
                {selectedCharity.is_featured && (
                  <div className="flex items-center gap-2 text-gold-deep font-bold text-sm bg-gold-light/50 w-max px-4 py-2 rounded-xl mt-auto border border-gold/20">
                    <Award size={18} /> Official BirdieFund Partner
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-white rounded-3xl p-10 border border-outline border-dashed text-center flex-1 flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-20 h-20 bg-surface-low rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Globe size={32} className="text-text-dim" />
                </div>
                <h3 className="text-2xl font-[family-name:var(--font-heading)] text-text mb-2">No Charity Selected</h3>
                <p className="text-text-muted max-w-md mx-auto text-sm leading-relaxed">Use the search box above to directly find and support a cause that matters to you.</p>
                
                {charities.length === 0 && (
                  <button 
                    onClick={seedSampleCharities}
                    className="mt-8 flex items-center gap-2 mx-auto text-green hover:text-white font-bold px-6 py-3 bg-green-mist hover:bg-green rounded-xl transition-all shadow-sm border border-green/20"
                  >
                    <Plus size={18} /> Load Sample Charities
                  </button>
                )}
              </div>

              {charities.length > 0 && !search && (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">Trending Causes</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {charities.filter(c => c.is_featured).slice(0, 2).map(charity => (
                      <button
                        key={charity.id}
                        onClick={() => setSelected(charity.id)}
                        className="bg-white p-5 rounded-2xl border border-outline hover:border-green hover:shadow-md transition-all text-left group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-text font-[family-name:var(--font-heading)]">{charity.name}</span>
                          <Plus size={14} className="text-text-dim group-hover:text-green" />
                        </div>
                        <p className="text-xs text-text-muted line-clamp-2">{charity.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contribution Sidebar */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-8 border border-outline shadow-sm sticky top-24"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-sm font-bold font-[family-name:var(--font-heading)] text-text uppercase tracking-widest pl-1">Donation Split</h2>
              <div className="bg-surface-low px-3 py-1 rounded-lg text-xs font-bold text-text-muted">From £10 Entry</div>
            </div>
            
            {/* Dynamic visualizer */}
            <div className="text-center mb-10 relative">
              <div className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-white relative border-8 border-surface-low shadow-inner">
                
                {/* SVG Progress Circle */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none scale-[1.05]" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="46" fill="transparent" 
                    stroke="url(#greenGradient)" strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray={`${(contribution / 100) * 289} 289`}
                    className="transition-all duration-700 ease-in-out drop-shadow-[0_0_8px_rgba(22,163,74,0.4)]"
                  />
                  <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#16a34a" />
                      <stop offset="100%" stopColor="#22c55e" />
                    </linearGradient>
                  </defs>
                </svg>

                <div className="flex flex-col items-center">
                  <span className="text-4xl font-extrabold font-[family-name:var(--font-heading)] text-green">£{contributionValue}</span>
                  <span className="text-xs font-bold text-text-dim mt-1">{contribution}% portion</span>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex justify-between text-[10px] font-bold text-text-dim mb-3 uppercase tracking-widest">
                <span>10% Min</span>
                <span>Select Percentage</span>
                <span>50% Max</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                step={5}
                value={contribution}
                onChange={(e) => setContribution(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer border border-outline/50 shadow-inner"
                style={{ background: `linear-gradient(to right, #16a34a ${((contribution - 10) / 40) * 100}%, #f1f5f9 ${((contribution - 10) / 40) * 100}%)` }}
              />
            </div>

            <button 
              onClick={saveCharity} 
              disabled={!selected || isSaving} 
              className="btn-primary w-full !py-4 text-base disabled:opacity-50 disabled:hover:-translate-y-0 flex items-center justify-center gap-2 group overflow-hidden relative"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-full group-hover:translate-x-full duration-700"></div>
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Heart size={20} className={selected ? 'animate-pulse text-gold' : ''} />
              )}
              {isSaving ? 'Processing Commitment...' : 'Commit Impact'}
            </button>
            
            <p className="text-xs text-text-dim text-center mt-4 leading-relaxed font-medium px-2">
              Your chosen contribution percentage is deducted automatically from your active monthly entry fee before the draw.
            </p>
          </motion.div>
        </div>

      </div>

      {/* Direct Impact Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 bg-white rounded-3xl border border-outline p-8 sm:p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-mist opacity-30 blur-3xl rounded-full translate-x-1/3 -translate-y-1/3" />
        
        <div className="flex flex-col lg:flex-row gap-12 relative z-10">
          <div className="lg:w-1/2">
            <div className="w-14 h-14 rounded-2xl bg-gold-light flex items-center justify-center mb-6">
              <Plus size={28} className="text-gold-deep" />
            </div>
            <h2 className="text-3xl font-bold font-[family-name:var(--font-heading)] text-text mb-4">Direct Impact</h2>
            <p className="text-text-muted text-lg leading-relaxed mb-6">
              Want to do more? Make a one-time contribution to our partner causes. 100% of these donations go directly to the charities, supporting initiatives from youth golf to environmental conservation.
            </p>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, text: "Secure payment processing" },
                { icon: Sparkles, text: "Instant tax-deductible receipt" },
                { icon: Heart, text: "100% direct charity transfer" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm font-medium text-text">
                  <div className="w-6 h-6 rounded-full bg-green/10 flex items-center justify-center">
                    <item.icon size={14} className="text-green" />
                  </div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="bg-surface-low rounded-2xl p-6 sm:p-8 border border-outline">
              <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text mb-6 flex items-center gap-2">
                <Wallet size={20} className="text-green" />
                One-time Gift
              </h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {['25', '50', '100'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDonationAmount(amt)}
                    className={`py-3 rounded-xl font-bold transition-all ${
                      donationAmount === amt 
                        ? 'bg-green text-white shadow-lg shadow-green/20' 
                        : 'bg-white border border-outline text-text-muted hover:border-green/50'
                    }`}
                  >
                    £{amt}
                  </button>
                ))}
              </div>

              <div className="relative mb-8">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim font-bold">£</span>
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full bg-white border border-outline rounded-xl pl-8 pr-4 py-3.5 text-lg font-bold text-text focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green"
                  placeholder="Custom amount"
                />
              </div>

              <button
                onClick={handleDirectDonation}
                disabled={isDonating || !donationAmount || Number(donationAmount) <= 0}
                className={`w-full group relative overflow-hidden px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 ${
                  donationSuccess ? 'bg-green' : 'bg-text hover:bg-green'
                } disabled:opacity-50`}
              >
                <span className={`flex items-center justify-center gap-2 transition-all duration-300 ${isDonating || donationSuccess ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                  Donate Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </span>
                
                {isDonating && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                {donationSuccess && (
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-green">
                    <CheckCircle size={20} />
                    Thank you!
                  </div>
                )}
              </button>

              <p className="text-[10px] text-text-dim text-center mt-4 uppercase tracking-widest font-bold">
                Transacting via secure payment gateway
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mission Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 rounded-3xl overflow-hidden relative group h-[300px] border border-outline"
      >
        <Image
          src="/charity-coaching.png"
          alt="Golf Coaching Mission"
          fill
          className="object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 sm:p-10">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">Empowering the Next Generation</h3>
            <p className="text-white/80 text-sm leading-relaxed">
              Your contributions directly fund youth coaching programs and facility development, ensuring the game of golf remains accessible and inspiring for all.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
