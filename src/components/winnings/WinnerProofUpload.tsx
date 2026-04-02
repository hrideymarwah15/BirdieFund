'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, X, CheckCircle, AlertCircle, FileText, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface WinnerProofUploadProps {
  winnerId: string
  onSuccess: () => void
}

export default function WinnerProofUpload({ winnerId, onSuccess }: WinnerProofUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB')
        return
      }
      setFile(selectedFile)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // Mocking storage upload for now (PRD doesn't specify bucket setup)
      // In a real app, we'd use: supabase.storage.from('proofs').upload(...)
      
      // Simulate delay
      await new Promise(r => setTimeout(r, 2000))

      // Update the winner record with a placeholder URL
      const { error: updateError } = await supabase
        .from('winners')
        .update({ 
          proof_image_url: `https://mock-storage.birdiefund.com/proofs/${winnerId}.png`,
          verification_status: 'pending'
        })
        .eq('id', winnerId)

      if (updateError) throw updateError

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to upload proof')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="bg-surface-low border border-outline rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gold-light flex items-center justify-center">
          <Upload size={20} className="text-gold-deep" />
        </div>
        <div>
          <h4 className="font-bold text-text">Verify Win</h4>
          <p className="text-xs text-text-dim">Upload score screenshot for payout</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 bg-green-mist rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green" />
            </div>
            <h5 className="font-bold text-text mb-1">Proof Submitted!</h5>
            <p className="text-sm text-text-dim">Our team will verify your scores shortly.</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {!file ? (
              <label className="border-2 border-dashed border-outline rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-green/50 transition-all group">
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                <div className="w-12 h-12 rounded-full bg-surface-mid flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ImageIcon size={24} className="text-text-dim" />
                </div>
                <span className="text-sm font-bold text-text mb-1">Click to select image</span>
                <span className="text-[10px] text-text-muted uppercase tracking-widest">Max 5MB (PNG, JPG)</span>
              </label>
            ) : (
              <div className="bg-white border border-outline rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center">
                      <FileText size={20} className="text-text-dim" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-text truncate max-w-[150px]">{file.name}</p>
                      <p className="text-[10px] text-text-dim">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="p-1 hover:bg-error-light hover:text-error rounded-md transition-colors">
                    <X size={16} />
                  </button>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-xs text-error mb-4 bg-error-light/30 p-2 rounded-lg">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn-primary w-full !py-2.5 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Verify Now
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
