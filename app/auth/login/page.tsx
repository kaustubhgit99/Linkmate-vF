'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const supabase = getSupabase()
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    let role = 'citizen'
    for (let i = 0; i < 5; i++) {
      if (i > 0) await new Promise(r => setTimeout(r, 500))
      const { data: prof } = await supabase.from('users').select('role').eq('id', data.user.id).single()
      if (prof?.role) { role = prof.role; break }
    }
    if (role === 'admin') router.replace('/admin')
    else if (role === 'owner') router.replace('/owner')
    else router.replace('/browse')
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:block lg:w-[52%] relative overflow-hidden">
        <div className="absolute inset-0 bg-[#141414]">
          <div className="absolute inset-0 opacity-35" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}/>
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent"/>
          {/* Subtle grid texture */}
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
              Your perfect room<br/>is waiting.
            </h2>
            <p className="text-white/45 text-[14px] mb-8">Join 1,800+ happy tenants across India.</p>
            {/* Testimonial */}
            <div className="bg-white/8 backdrop-blur-sm border border-white/12 rounded-[16px] p-5">
              <p className="text-white/80 text-[13.5px] leading-relaxed mb-3">
                &ldquo;Found my perfect PG in Bangalore within 2 days. The process was seamless.&rdquo;
              </p>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-[12px] font-bold">A</div>
                <div>
                  <p className="text-white text-[12px] font-semibold">Ananya S.</p>
                  <p className="text-white/40 text-[11px]">Tenant, Bangalore</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-9 lg:hidden">
            <div className="w-8 h-8 rounded-[10px] bg-[#141414] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span className="font-display text-[18px] text-[#141414]">LinkMate</span>
          </div>

          <h1 className="font-display text-[#141414] mb-1.5" style={{ fontSize: '2rem' }}>Welcome back</h1>
          <p className="text-[14px] text-[#5A5A58] mb-8">Sign in to continue to your account</p>

          {error && (
            <div className="flex items-center gap-2.5 p-3.5 rounded-[12px] bg-red-50 border border-red-100 text-red-600 text-[13px] mb-6">
              <AlertCircle className="w-4 h-4 shrink-0"/>{error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="field-label">Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="field"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label">Password</label>
                <a href="#" className="text-[12px] text-[#5A5A58] hover:text-[#141414] transition-colors font-medium">Forgot password?</a>
              </div>
              <div className="input-group input-group-right relative">
                <input
                  type={show ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="field pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="input-icon-right absolute right-3 top-1/2 -translate-y-1/2 text-[#A0A09E] hover:text-[#5A5A58] transition-colors">
                  {show ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-dark w-full justify-center py-3.5 mt-2 text-[14px]">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-[13px] text-[#5A5A58] mt-6">
            No account?{' '}
            <Link href="/auth/signup" className="font-semibold text-[#141414] hover:opacity-70 transition-opacity">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
