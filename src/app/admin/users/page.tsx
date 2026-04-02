'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Users, Search, Shield } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('profiles').select('*, charities(name)').order('created_at', { ascending: false })
      setUsers(data || [])
      setLoading(false)
    })()
  }, [])

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'subscriber' : 'admin'
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId)
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const toggleSubscription = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const plan = newStatus === 'active' ? 'monthly' : null
    const periodEnd = newStatus === 'active' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
    await supabase.from('profiles').update({ subscription_status: newStatus, subscription_plan: plan, subscription_current_period_end: periodEnd }).eq('id', userId)
    setUsers(users.map(u => u.id === userId ? { ...u, subscription_status: newStatus, subscription_plan: plan } : u))
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="pb-10">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 pt-4">
        <h1 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-text tracking-tight mb-2">
          User <span className="text-gold-deep italic pr-2">Management</span>
        </h1>
        <p className="text-text-muted text-lg">View and manage all platform users securely.</p>
      </motion.div>

      <div className="relative mb-8 max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
        <input 
          type="text" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="w-full bg-white border border-outline py-4 pl-12 pr-6 text-text placeholder:text-text-dim focus:outline-none focus:ring-4 focus:ring-green/10 focus:border-green rounded-2xl font-medium transition-all shadow-sm" 
          placeholder="Search by name or email..." 
        />
      </div>

      <div className="bg-white rounded-3xl border border-outline shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-low/50">
              <tr className="border-b border-outline">
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">User Profile</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Role</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Subscription</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Active Charity Focus</th>
                <th className="text-left px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Join Date</th>
                <th className="text-right px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-text-muted">Administrative Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12"><div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-surface-low border border-outline border-dashed flex items-center justify-center mx-auto mb-4">
                      <Users className="text-text-dim opacity-50" size={24} />
                    </div>
                    <h3 className="text-lg font-[family-name:var(--font-heading)] font-bold text-text mb-1">No Users Found</h3>
                    <p className="text-text-muted text-sm">Try adjusting your search criteria.</p>
                  </td>
                </tr>
              ) : filtered.map((user) => (
                <tr key={user.id} className="border-b border-outline hover:bg-surface-base transition-colors duration-200">
                  <td className="px-6 py-5">
                    <div className="font-bold text-sm text-text font-[family-name:var(--font-heading)]">{user.full_name || 'Unnamed User'}</div>
                    <div className="text-xs text-text-muted">{user.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      user.role === 'admin' ? 'bg-gold-light text-gold-deep border-gold/20' : 'bg-surface-mid text-text-muted border-outline'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                      user.subscription_status === 'active' ? 'bg-green-mist text-green-dark border-green/20' : 'bg-error-light text-error border-error/20'
                    }`}>
                      {user.subscription_status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-text-dim">
                    {user.charities?.name || '—'}
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-text-dim">
                    {formatDate(user.created_at)}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                       <button
                        onClick={() => toggleRole(user.id, user.role)}
                        className={`p-2 rounded-xl border transition-all flex items-center justify-center group ${
                          user.role === 'admin' ? 'bg-gold-light text-gold-deep border-gold/20 hover:bg-white hover:shadow-sm' : 'bg-surface-low text-text-muted border-outline hover:bg-surface-mid'
                        }`}
                        title={user.role === 'admin' ? 'Revoke Admin Privileges' : 'Grant Admin Privileges'}
                      >
                        <Shield size={16} className="group-hover:scale-110 transition-transform" />
                      </button>
                      <button
                        onClick={() => toggleSubscription(user.id, user.subscription_status)}
                        className={`text-xs px-4 py-2 rounded-xl border transition-all font-bold uppercase tracking-widest ${
                          user.subscription_status === 'active' 
                            ? 'bg-surface-low text-error border-outline hover:border-error/20 hover:bg-error-light' 
                            : 'bg-white border-green/40 text-green shadow-sm hover:bg-green-mist hover:border-green/60'
                        }`}
                      >
                        {user.subscription_status === 'active' ? 'Revoke' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
