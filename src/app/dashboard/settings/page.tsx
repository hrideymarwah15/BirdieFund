'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User, Mail, CreditCard, LogOut, CheckCircle, Shield, ArrowRight, Activity, AlertCircle, Settings, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsPage() {
  const [profile, setProfile] = useState<{ id: string; full_name: string; email: string; handicap: string; bio: string; location: string } | null>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [charities, setCharities] = useState<any[]>([])
  const [selectedCharityId, setSelectedCharityId] = useState('')
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [handicap, setHandicap] = useState('')
  const [location, setLocation] = useState('')
  const [message, setMessage] = useState({ text: '', type: 'success' })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState<'plan' | 'payment' | 'success'>('plan')
  const [planType, setPlanType] = useState<'monthly' | 'yearly'>('monthly')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
    fetchSubscriptions()
    fetchCharities()
  }, [])

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setProfile({ ...data, email: user.email || '' })
      setFullName(data.full_name || '')
      setBio(data.bio || '')
      setHandicap(data.handicap || '')
      setLocation(data.location || '')
    }
  }

  const fetchSubscriptions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('subscriptions')
      .select('*, charities(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (data) setSubscriptions(data)
  }

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*').eq('is_active', true)
    if (data) {
      setCharities(data)
      if (data.length > 0) setSelectedCharityId(data[0].id)
    }
  }

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: 'success' }), 4000)
  }

  const updateProfile = async () => {
    setIsLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    const { error } = await supabase.from('profiles').update({ 
      full_name: fullName,
      bio,
      handicap,
      location 
    }).eq('id', user.id)
    
    setIsLoading(false)
    if (error) {
      showMessage(error.message, 'error')
    } else {
      showMessage('Profile updated successfully!')
      fetchProfile() // Refresh header via context eventually, but local state works for now
    }
  }

  const handleSubscription = async (action: 'subscribe' | 'cancel', subscriptionId?: string) => {
    setIsSubscribing(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (action === 'subscribe') {
      // Create new subscription
      const { error } = await supabase.from('subscriptions').insert({
        user_id: user.id,
        charity_id: selectedCharityId,
        plan: planType,
        amount: planType === 'monthly' ? 10 : 100,
        currency: 'GBP',
        status: 'active',
        next_billing_date: new Date(Date.now() + (planType === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
      })
      
      setIsSubscribing(false)
      if (error) {
        showMessage(error.message, 'error')
      } else {
        setCheckoutStep('success')
        fetchSubscriptions()
      }
    } else if (action === 'cancel' && subscriptionId) {
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'inactive' })
        .eq('id', subscriptionId)
      
      setIsSubscribing(false)
      if (error) {
        showMessage(error.message, 'error')
      } else {
        showMessage('Subscription canceled.')
        fetchSubscriptions()
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = subscriptions.some(s => s.status === 'active')

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-mist opacity-30 blur-[100px] rounded-full pointer-events-none -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="mb-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-outline shadow-sm mb-4">
          <Settings size={14} className="text-text-dim" />
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Preferences</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-[family-name:var(--font-heading)] text-text tracking-tight">Account Settings</h1>
        <p className="text-text-muted mt-3 text-lg leading-relaxed max-w-xl">Manage your profile, billing, and security preferences.</p>
      </div>

      <AnimatePresence>
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-2xl px-5 py-4 mb-8 shadow-xl flex items-center gap-3 font-medium border ${
              message.type === 'error' ? 'bg-error-light text-error shadow-error/10 border-error/20' : 'bg-green-dark text-white shadow-green-dark/20 border-green'
            }`}
          >
            {message.type === 'error' ? <AlertCircle size={20} /> : <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center"><CheckCircle size={18} className="text-gold" /></div>} 
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
        
        {/* Left Column: Personal Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-outline shadow-sm relative overflow-hidden">
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-mist flex items-center justify-center"><User size={20} className="text-green-dark" /></div>
              Personal Information
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold text-text-muted mb-2 block uppercase tracking-widest pl-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface-base border border-outline py-4 px-5 text-text placeholder:text-text-dim focus:outline-none focus:ring-4 focus:ring-green/10 focus:border-green rounded-2xl font-medium transition-all"
                />
              </div>
              
              <div>
                <label className="text-[10px] font-bold text-text-muted mb-2 block uppercase tracking-widest pl-1">Email Address</label>
                <div className="flex items-center gap-3 text-text-muted font-medium text-sm px-5 py-4 bg-surface-low border border-outline/50 rounded-2xl cursor-not-allowed">
                  <Mail size={18} className="text-text-dim" />
                  {profile?.email || 'Loading...'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-bold text-text-muted mb-2 block uppercase tracking-widest pl-1">Handicap Index</label>
                  <input
                    type="text"
                    value={handicap}
                    onChange={(e) => setHandicap(e.target.value)}
                    placeholder="e.g. 12.4"
                    className="w-full bg-surface-base border border-outline py-4 px-5 text-text placeholder:text-text-dim focus:outline-none focus:ring-4 focus:ring-green/10 focus:border-green rounded-2xl font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted mb-2 block uppercase tracking-widest pl-1">Home Club / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. St Andrews, UK"
                    className="w-full bg-surface-base border border-outline py-4 px-5 text-text placeholder:text-text-dim focus:outline-none focus:ring-4 focus:ring-green/10 focus:border-green rounded-2xl font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted mb-2 block uppercase tracking-widest pl-1">Short Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about your golf journey..."
                  rows={3}
                  className="w-full bg-surface-base border border-outline py-4 px-5 text-text placeholder:text-text-dim focus:outline-none focus:ring-4 focus:ring-green/10 focus:border-green rounded-2xl font-medium transition-all resize-none"
                />
              </div>

              <div className="pt-6 mt-2 border-t border-outline/50">
                <button 
                  onClick={updateProfile} 
                  disabled={isLoading}
                  className="btn-primary px-8 !py-4"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-outline shadow-sm">
            <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-6 flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center"><Shield size={20} className="text-gold-deep" /></div>
              Security
            </h2>
            <p className="text-text-muted text-sm mb-8 leading-relaxed">You are authenticated securely via Supabase. If you are on a shared device, ensure you sign out when finished.</p>
            
            <button 
              onClick={handleLogout} 
              className="flex items-center px-6 gap-3 py-4 rounded-2xl text-error bg-error-light/50 border border-error/20 hover:bg-error hover:text-white transition-all font-bold group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Billing & Subscription Engine */}
        <div className="space-y-8 h-full">
          <div className="bg-white rounded-3xl p-8 border border-outline shadow-sm flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-low flex items-center justify-center">
                  <CreditCard size={20} className="text-green" /> 
                </div>
                My Entries
              </h2>
              <button 
                onClick={() => {
                  setCheckoutStep('plan')
                  setShowCheckout(true)
                }}
                className="p-2 rounded-xl bg-green-mist text-green-dark hover:bg-green hover:text-white transition-all shadow-sm"
                title="Add New Entry"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
              {subscriptions.length > 0 ? (
                subscriptions.map((sub) => (
                  <div key={sub.id} className={`p-5 rounded-2xl border transition-all ${sub.status === 'active' ? 'bg-surface-low border-green/30 shadow-sm' : 'bg-surface-base border-outline opacity-70'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-text-dim mb-1">Monthly Entry</div>
                        <div className="font-bold text-text truncate max-w-[150px]">
                          {sub.charities?.name || 'Supporting Charity'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block font-bold mb-1 ${sub.status === 'active' ? 'bg-green-mist text-green-dark' : 'bg-gray-100 text-gray-500'}`}>
                          {sub.status.toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-text">£{sub.amount}</div>
                      </div>
                    </div>
                    {sub.status === 'active' && (
                      <button 
                        onClick={() => handleSubscription('cancel', sub.id)}
                        disabled={isSubscribing}
                        className="text-[10px] font-bold text-error/60 hover:text-error transition-colors uppercase tracking-widest mt-2"
                      >
                        Cancel Entry
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-6">
                  <div className="w-16 h-16 bg-surface-low rounded-full flex items-center justify-center mx-auto mb-4 text-text-dim">
                    <CreditCard size={24} />
                  </div>
                  <p className="text-text-muted text-sm font-medium">You have no active entries.</p>
                  <button 
                    onClick={() => setShowCheckout(true)}
                    className="text-green-dark text-xs font-bold uppercase tracking-widest mt-4 hover:underline"
                  >
                    Get Premium Now
                  </button>
                </div>
              )}
            </div>

            {subscriptions.length > 0 && (
              <div className="pt-6 mt-6 border-t border-outline/50">
                <div className="flex justify-between items-center text-sm font-bold text-text mb-4">
                  <span className="text-text-muted">Total Monthly Contribution</span>
                  <span className="text-lg">£{subscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + (s.amount || 0), 0).toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-text-dim leading-relaxed">
                  Entries are processed automatically at the start of each month. 
                  50% of your net entry goes directly to your selected charities.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubscribing && setShowCheckout(false)}
              className="absolute inset-0 bg-green-dark/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
              {checkoutStep === 'success' ? (
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-green-mist rounded-full flex items-center justify-center mx-auto mb-8 relative">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12 }}
                      className="text-green"
                    >
                      <CheckCircle size={48} />
                    </motion.div>
                    <div className="absolute inset-0 rounded-full border-4 border-green animate-ping opacity-20" />
                  </div>
                  <h2 className="text-3xl font-[family-name:var(--font-heading)] text-text mb-4">Welcome Aboard!</h2>
                  <p className="text-text-muted leading-relaxed mb-8">Your subscription is now active. You've been automatically entered into the next draw.</p>
                  <button onClick={() => setShowCheckout(false)} className="btn-primary w-full !py-4">Back to Settings</button>
                </div>
              ) : (
                <div className="p-8 sm:p-10">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-text">Premium Membership</h2>
                    <button onClick={() => setShowCheckout(false)} className="text-text-dim hover:text-text transition-colors">
                      <Plus size={24} className="rotate-45" />
                    </button>
                  </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Choose Charity</label>
                      <select 
                        value={selectedCharityId}
                        onChange={(e) => setSelectedCharityId(e.target.value)}
                        className="w-full bg-surface-base border border-outline py-4 px-5 text-text focus:outline-none focus:ring-4 focus:ring-green/10 focus:border-green rounded-2xl font-medium transition-all"
                      >
                        {charities.map(charity => (
                          <option key={charity.id} value={charity.id}>{charity.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Select Plan</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setPlanType('monthly')}
                          className={`p-4 rounded-2xl border-2 transition-all text-left ${planType === 'monthly' ? 'border-green bg-green-mist' : 'border-outline hover:border-text-dim'}`}
                        >
                          <div className="text-xs font-bold text-text-muted uppercase mb-1">Monthly</div>
                          <div className="text-xl font-extrabold text-text">£10<span className="text-sm font-medium text-text-dim">/mo</span></div>
                        </button>
                        <button 
                          onClick={() => setPlanType('yearly')}
                          className={`p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden ${planType === 'yearly' ? 'border-green bg-green-mist' : 'border-outline hover:border-text-dim'}`}
                        >
                          <div className="absolute top-0 right-0 bg-gold text-green-dark text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase">Best Value</div>
                          <div className="text-xs font-bold text-text-muted uppercase mb-1">Yearly</div>
                          <div className="text-xl font-extrabold text-text">£100<span className="text-sm font-medium text-text-dim">/yr</span></div>
                        </button>
                      </div>
                    </div>

                    <div className="p-6 bg-surface-low rounded-2xl border border-outline/50 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Selected Membership</div>
                        <div className="text-base font-bold text-text">{planType === 'monthly' ? 'Monthly Entry' : 'Yearly Founding Member'}</div>
                      </div>
                      <div className="text-2xl font-bold text-green font-[family-name:var(--font-heading)]">£{planType === 'monthly' ? '10.00' : '100.00'}</div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest pl-1">Payment Method</label>
                      <div className="p-4 bg-white border-2 border-green rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 bg-surface-mid rounded-md flex items-center justify-center font-bold text-[8px] text-text-dim border border-outline">STRIKE</div>
                          <span className="text-sm font-bold text-text">•••• •••• •••• 4242</span>
                        </div>
                        <CheckCircle size={18} className="text-green" />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        onClick={() => handleSubscription('subscribe')}
                        disabled={isSubscribing}
                        className="btn-primary w-full !py-4 text-base flex items-center justify-center gap-2 shadow-xl shadow-green/20"
                      >
                        {isSubscribing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Authorizing Transaction...
                          </>
                        ) : (
                          <>Confirm & Subscribe</>
                        )}
                      </button>
                      <p className="text-[10px] text-text-dim text-center mt-4 px-8 leading-relaxed">
                        Secure SSL encrypted checkout. No hidden fees. Cancel anytime.
                      </p>
                    </div>
                  </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-12 bg-white rounded-3xl p-8 sm:p-10 border border-outline shadow-sm">
        <h2 className="text-xl font-bold font-[family-name:var(--font-heading)] text-text mb-6 flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center"><Shield size={20} className="text-gold-deep" /></div>
          Security
        </h2>
        <p className="text-text-muted text-sm mb-8 leading-relaxed">You are authenticated securely via Supabase. If you are on a shared device, ensure you sign out when finished.</p>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center px-6 gap-3 py-4 rounded-2xl text-error bg-error-light/50 border border-error/20 hover:bg-error hover:text-white transition-all font-bold group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Sign Out
        </button>
      </div>
    </div>
  )
}
