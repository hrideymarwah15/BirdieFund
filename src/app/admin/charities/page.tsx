'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { Heart, Plus, Trash2, Edit, Star, X } from 'lucide-react'

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', description: '', website_url: '', is_featured: false })
  const supabase = createClient()

  const fetchCharities = async () => {
    const { data } = await supabase.from('charities').select('*').order('is_featured', { ascending: false })
    setCharities(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCharities() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editId) {
      await supabase.from('charities').update(form).eq('id', editId)
    } else {
      await supabase.from('charities').insert(form)
    }
    setShowForm(false)
    setEditId(null)
    setForm({ name: '', description: '', website_url: '', is_featured: false })
    await fetchCharities()
  }

  const startEdit = (charity: any) => {
    setForm({ name: charity.name, description: charity.description || '', website_url: charity.website_url || '', is_featured: charity.is_featured })
    setEditId(charity.id)
    setShowForm(true)
  }

  const deleteCharity = async (id: string) => {
    if (!confirm('Delete this charity?')) return
    await supabase.from('charities').delete().eq('id', id)
    await fetchCharities()
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    await supabase.from('charities').update({ is_featured: !current }).eq('id', id)
    await fetchCharities()
  }

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-heading)] text-text tracking-tight mb-1">
            Charity <span className="text-gradient-gold">Management</span>
          </h1>
          <p className="text-text-muted text-sm">Add, edit, and manage partner charities</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', description: '', website_url: '', is_featured: false }) }} className="btn-primary flex items-center gap-2">
          <Plus size={14} /> Add Charity
        </button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-elevated bg-white p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-text">{editId ? 'Edit' : 'Add'} Charity</h2>
            <button onClick={() => setShowForm(false)} className="text-text-dim hover:text-text"><X size={18} /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Charity name" required />
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field min-h-[100px] resize-y" placeholder="Description" />
            <input type="url" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} className="input-field" placeholder="Website URL" />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-green" />
              <span className="text-sm text-text-muted">Featured charity</span>
            </label>
            <button type="submit" className="btn-primary">{editId ? 'Update' : 'Add'} Charity</button>
          </form>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-green border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {charities.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="card-elevated bg-white p-6 relative group">
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => toggleFeatured(c.id, c.is_featured)} className={`p-1.5 rounded-lg ${c.is_featured ? 'bg-gold-light text-gold-deep' : 'bg-surface-low text-text-dim'}`}>
                  <Star size={14} />
                </button>
                <button onClick={() => startEdit(c)} className="p-1.5 rounded-lg bg-surface-low text-text-dim hover:text-green"><Edit size={14} /></button>
                <button onClick={() => deleteCharity(c.id)} className="p-1.5 rounded-lg bg-surface-low text-text-dim hover:text-error"><Trash2 size={14} /></button>
              </div>
              {c.is_featured && <span className="badge badge-gold text-[10px] mb-3">Featured</span>}
              <div className="w-full h-20 rounded-xl bg-green-mist mb-4 flex items-center justify-center">
                <Heart size={24} className="text-green" />
              </div>
              <h3 className="font-bold font-[family-name:var(--font-heading)] text-text mb-2">{c.name}</h3>
              <p className="text-text-muted text-sm line-clamp-2">{c.description}</p>
              <div className="text-xs text-text-dim mt-3">Status: <span className={c.is_active ? 'text-green' : 'text-error'}>{c.is_active ? 'Active' : 'Inactive'}</span></div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
