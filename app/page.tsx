'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, ShieldCheck, Zap, Star, ChevronDown } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { RoomCard, RoomCardSkeleton } from '@/components/rooms/RoomCard'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { CITIES } from '@/lib/utils'

const HERO_IMGS = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1800&q=85',
  'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1800&q=85',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1800&q=85',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1800&q=85',
]

export default function HomePage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState('')
  const [heroIdx, setHeroIdx] = useState(0)
  const { user } = useAuth()
  const router = useRouter()
  const supabase = useRef(getSupabase()).current

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(full_name,phone)')
      .eq('is_available', true).order('created_at', { ascending: false }).limit(8)
      .then(({ data }) => { if (data) setRooms(data); setLoading(false) })
  }, [supabase])

  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMGS.length), 5500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>

      {/* ── HERO ── */}
      <section className="relative h-[100svh] min-h-[600px] max-h-[940px] overflow-hidden">
        {/* Background images */}
        {HERO_IMGS.map((src, i) => (
          <div key={src} className={`absolute inset-0 transition-opacity duration-1500 ${i === heroIdx ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={src} alt="" fill className="object-cover" priority={i === 0} sizes="100vw"/>
          </div>
        ))}
        <div className="absolute inset-0 img-overlay"/>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 text-center">

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-[11.5px] font-semibold px-4 py-2 rounded-full mb-8 border border-white/18 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              2,400+ verified rooms across India
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.7 }}
            className="font-display text-white leading-[1.06] mb-5 tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.6rem, 6.5vw, 5.2rem)' }}>
            Find your next home<br/><em>away from home.</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.65 }}
            className="text-white/60 mb-10 max-w-md leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 2vw, 1.08rem)' }}>
            Discover verified rooms, connect with trusted owners,<br className="hidden sm:block"/> and move in with confidence.
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.65 }}
            className="w-full max-w-xl">
            <div className="search-bar p-[6px]">
              <div className="flex items-center flex-1 px-4 gap-2.5 min-w-0">
                <MapPin className="w-4 h-4 text-[#A0A09E] shrink-0"/>
                <input
                  list="cities-list"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="Search by city or area..."
                  className="flex-1 bg-transparent outline-none text-[14px] text-[#141414] placeholder-[#A0A09E] py-2.5 min-w-0 font-[450]"
                />
                <datalist id="cities-list">{CITIES.map(c => <option key={c} value={c}/>)}</datalist>
              </div>
              <button
                onClick={() => router.push(`/browse${city ? `?city=${encodeURIComponent(city)}` : ''}`)}
                className="btn btn-dark shrink-0 rounded-full px-5 py-3 text-[13.5px]">
                <Search className="w-4 h-4"/> Search
              </button>
            </div>

            {/* Quick cities */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 justify-center mt-4">
              <span className="text-white/35 text-[12px] font-medium">Popular:</span>
              {['Mumbai', 'Bangalore', 'Delhi', 'Pune', 'Hyderabad'].map(c => (
                <button key={c} onClick={() => router.push(`/browse?city=${c}`)}
                  className="text-white/55 hover:text-white text-[12px] transition-colors font-medium">
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Slide dots */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_IMGS.map((_, i) => (
            <button key={i} onClick={() => setHeroIdx(i)}
              className={`rounded-full transition-all duration-400 ${i === heroIdx ? 'w-6 h-2 bg-white' : 'w-2 h-2 bg-white/35 hover:bg-white/60'}`}/>
          ))}
        </div>

        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/25 z-10">
          <ChevronDown className="w-5 h-5"/>
        </motion.div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-y border-[#E4E4E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-9 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {[
            { v: '2,400+', l: 'Rooms Listed' },
            { v: '1,800+', l: 'Happy Tenants' },
            { v: '20+', l: 'Cities' },
            { v: '600+', l: 'Verified Owners' }
          ].map((s, i) => (
            <motion.div
              key={s.l}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}>
              <div className="font-display text-[#141414]" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>{s.v}</div>
              <div className="text-[13px] text-[#5A5A58] mt-1 font-medium">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ROOMS ── */}
      <section className="py-20 px-5 sm:px-8 lg:px-12 max-w-[1280px] mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="section-label mb-2">Featured</p>
            <h2 className="font-display text-[#141414]" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>
              Latest Rooms
            </h2>
            <p className="text-[14px] text-[#5A5A58] mt-1.5">Handpicked spaces, freshly listed</p>
          </div>
          <Link href="/browse" className="hidden sm:flex items-center gap-1.5 text-[13px] font-semibold text-[#141414] hover:opacity-60 transition-opacity">
            View all <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array(8).fill(0).map((_, i) => <RoomCardSkeleton key={i}/>)}
          </div>
        ) : rooms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {rooms.map((r, i) => <RoomCard key={r.id} room={r} userId={user?.id} index={i}/>)}
          </div>
        ) : (
          <div className="text-center py-24 text-[#5A5A58]">
            <div className="w-16 h-16 rounded-2xl bg-[#F2F2F0] border border-[#E4E4E2] flex items-center justify-center mx-auto mb-5">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#A0A09E]"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <p className="font-semibold text-[#141414] text-[16px]">No rooms yet</p>
            <p className="text-[13px] mt-1.5 mb-6">Be the first to list one!</p>
            <Link href="/auth/signup"><span className="btn btn-dark px-6 py-3">List a Room</span></Link>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/browse">
            <span className="btn btn-dark px-10 py-3.5 text-[14px]">
              Browse All Rooms <ArrowRight className="w-4 h-4"/>
            </span>
          </Link>
        </div>
      </section>

      {/* ── WHY LINKMATE ── */}
      <section className="bg-white py-20 px-5 sm:px-8 lg:px-12 border-y border-[#E4E4E2]">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-14">
            <p className="section-label mb-3">Why us</p>
            <h2 className="font-display text-[#141414]" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>
              Why Choose LinkMate?
            </h2>
            <p className="text-[14px] text-[#5A5A58] mt-2.5 max-w-md mx-auto">
              We built the experience we wished existed when looking for a room.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Verified Listings', desc: 'Every listing is reviewed by our team to ensure safety and accuracy for our community.', tag: 'Safety' },
              { icon: Star, title: 'Trusted Owners', desc: 'Connect directly with verified property owners. No middlemen, no hidden fees, no surprises.', tag: 'Trust' },
              { icon: Zap, title: 'Instant Connect', desc: 'Send enquiries directly to owners and get replies fast — all from one clean interface.', tag: 'Speed' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.55 }}
                className="bg-[#F7F7F6] rounded-[20px] p-7 border border-[#E4E4E2] hover:border-[#CECECE] transition-colors">
                <div className="w-11 h-11 rounded-[12px] bg-white border border-[#E4E4E2] flex items-center justify-center mb-5 shadow-sm">
                  <f.icon className="w-5 h-5 text-[#141414]"/>
                </div>
                <span className="badge badge-gray mb-3">{f.tag}</span>
                <h3 className="font-semibold text-[#141414] text-[15.5px] mb-2.5">{f.title}</h3>
                <p className="text-[13.5px] text-[#5A5A58] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-5 sm:px-8 lg:px-12 max-w-[1280px] mx-auto">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Process</p>
          <h2 className="font-display text-[#141414]" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>
            How LinkMate Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-[28px] left-[calc(16.67%+16px)] right-[calc(16.67%+16px)] h-px bg-[#E4E4E2]"/>

          {[
            { n: '01', t: 'Search & Filter', d: 'Find rooms by city, price, type and amenities in seconds.' },
            { n: '02', t: 'View & Enquire', d: 'Explore photos and details. Send a direct enquiry to the owner.' },
            { n: '03', t: 'Move In', d: 'Get a reply from the owner and move into your perfect room.' },
          ].map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              className="text-center relative">
              <div className="w-14 h-14 rounded-full bg-white border border-[#E4E4E2] flex items-center justify-center mx-auto mb-5 shadow-sm relative z-10">
                <span className="font-display text-[#141414] text-[1.1rem]">{s.n}</span>
              </div>
              <h3 className="font-semibold text-[15.5px] text-[#141414] mb-2">{s.t}</h3>
              <p className="text-[13.5px] text-[#5A5A58] leading-relaxed max-w-[220px] mx-auto">{s.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-5 sm:px-8 lg:px-12 pb-20 max-w-[1280px] mx-auto">
        <div className="relative rounded-[24px] overflow-hidden" style={{ boxShadow: 'var(--shadow-xl)' }}>
          <Image
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1400&q=80"
            alt=""
            width={1400}
            height={420}
            className="w-full h-64 sm:h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/45 to-black/15 flex items-center px-10 sm:px-14">
            <div className="max-w-md">
              <p className="section-label text-white/40 mb-3">Get started</p>
              <h2 className="font-display text-white mb-3 leading-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.1rem)' }}>
                Ready to find your room?
              </h2>
              <p className="text-white/60 text-[14px] mb-7 leading-relaxed">
                Join LinkMate and discover thousands of verified rooms across India.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/auth/signup">
                  <span className="btn px-7 py-3 text-[13.5px] rounded-full font-semibold" style={{ background: 'white', color: '#141414', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                    Get Started Free
                  </span>
                </Link>
                <Link href="/browse">
                  <span className="btn px-7 py-3 text-[13.5px] text-white border border-white/25 rounded-full hover:bg-white/10 transition-colors font-semibold">
                    Browse Rooms
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-[#E4E4E2]">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-[10px] bg-[#141414] flex items-center justify-center">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <span className="font-display text-[18px] text-[#141414] leading-none">LinkMate</span>
              </div>
              <p className="text-[13px] text-[#5A5A58] leading-relaxed max-w-[200px]">
                Finding your perfect room shouldn&apos;t be hard. We connect you with verified owners.
              </p>
            </div>
            {[
              { title: 'Quick Links', links: [['Find a Room', '/browse'], ['List a Room', '/auth/signup'], ['Sign In', '/auth/login']] },
              { title: 'Company', links: [['About Us', '#'], ['Safety Tips', '#'], ['Contact', '#']] },
              { title: 'Top Cities', links: CITIES.slice(0, 5).map(c => [c, `/browse?city=${c}`]) },
            ].map(col => (
              <div key={col.title}>
                <p className="section-label mb-4">{col.title}</p>
                <div className="space-y-2">
                  {col.links.map(([l, h]) => (
                    <Link key={l} href={h} className="block text-[13px] text-[#5A5A58] hover:text-[#141414] transition-colors font-medium">{l}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E4E4E2] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-[#A0A09E]">© 2024 LinkMate Technologies. All rights reserved.</p>
            <p className="text-[12px] text-[#A0A09E]">Made with care in India 🇮🇳</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
