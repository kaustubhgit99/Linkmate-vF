'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, UserCircle, Home } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

export default function SignupPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [role, setRole] = useState<'citizen' | 'owner'>('citizen')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const supabase = getSupabase()
    const { data, error: err } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name, role } } })
    if (err) { setError(err.message); setLoading(false); return }
    if (data.user) {
      if (data.session) {
        await supabase.from('users').upsert({ id: data.user.id, email: form.email, full_name: form.name, role, phone: form.phone || null })
        router.replace(role === 'owner' ? '/owner' : '/browse')
      } else { setEmailSent(true); setLoading(false) }
    } else { setLoading(false) }
  }

  if (emailSent) return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12" style={{ background: 'var(--bg)' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-sm bg-white rounded-[24px] border border-[#E4E4E2] p-10 text-center" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-7 h-7 text-green-600"/>
        </div>
        <h2 className="font-display text-[#141414] text-[1.7rem] mb-2">Check your email</h2>
        <p className="text-[13.5px] text-[#5A5A58] mb-2">We sent a confirmation link to</p>
        <p className="font-semibold text-[#141414] text-[14px] mb-6">{form.email}</p>
        <p className="text-[13px] text-[#5A5A58] mb-8">Click the link to confirm your account, then sign in.</p>
        <Link href="/auth/login"><span className="btn btn-dark w-full justify-center py-3">Go to Sign In</span></Link>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left image panel */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#141414]">
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent"/>
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '48px 48px' }}/>
        </div>
        <div className="relative h-full flex flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-white/12 backdrop-blur border border-white/20 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="font-display text-white text-[18px]">LinkMate</span>
          </div>
          <div>
            <h2 className="font-display text-white leading-tight mb-3" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)' }}>
              List your room.<br/>Reach thousands.
            </h2>
            <p className="text-white/45 text-[14px]">600+ verified owners already trust LinkMate.</p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[360px]">
          <div className="flex items-center gap-2.5 mb-9 lg:hidden">
            <div className="w-8 h-8 rounded-[10px] bg-[#141414] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="font-display text-[18px] text-[#141414]">LinkMate</span>
          </div>

          <h1 className="font-display text-[#141414] mb-1.5" style={{ fontSize: '2rem' }}>Create account</h1>
          <p className="text-[14px] text-[#5A5A58] mb-7">Join thousands finding their perfect home</p>

          {/* Role picker */}
          <div className="grid grid-cols-2 gap-3 mb-7">
            {[
              { r: 'citizen' as const, icon: UserCircle, title: 'Find a Room', desc: 'Browse & rent' },
              { r: 'owner' as const, icon: Home, title: 'List a Room', desc: 'Post & manage' },
            ].map(opt => (
              <button key={opt.r} type="button" onClick={() => setRole(opt.r)}
                className={`p-4 rounded-[14px] border-2 text-left transition-all ${role === opt.r ? 'border-[#141414] bg-[#141414]' : 'border-[#E4E4E2] bg-[#F7F7F6] hover:border-[#CECECE] hover:bg-white'}`}>
                <opt.icon className={`w-5 h-5 mb-2.5 ${role === opt.r ? 'text-white' : 'text-[#A0A09E]'}`}/>
                <div className={`font-semibold text-[13px] ${role === opt.r ? 'text-white' : 'text-[#141414]'}`}>{opt.title}</div>
                <div className={`text-[11px] mt-0.5 ${role === opt.r ? 'text-white/55' : 'text-[#A0A09E]'}`}>{opt.desc}</div>
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-[12px] bg-red-50 border border-red-100 text-red-600 text-[13px] mb-5">
              <AlertCircle className="w-4 h-4 shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {[
              { k: 'name', label: 'Full Name', type: 'text', placeholder: 'John Doe', req: true },
              { k: 'email', label: 'Email address', type: 'email', placeholder: 'you@example.com', req: true },
              { k: 'phone', label: 'Phone (optional)', type: 'tel', placeholder: '+91 98765 43210', req: false },
            ].map(f => (
              <div key={f.k}>
                <label className="field-label">{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={(form as any)[f.k]}
                  onChange={e => set(f.k, e.target.value)}
                  required={f.req}
                  className="field"
                />
              </div>
            ))}
            <div>
              <label className="field-label">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  required
                  minLength={6}
                  className="field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A09E] hover:text-[#5A5A58] transition-colors">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-dark w-full justify-center py-3.5 mt-2 text-[14px]">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Creating account...</> : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-[13px] text-[#5A5A58] mt-5">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[#141414] hover:opacity-70 transition-opacity">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
