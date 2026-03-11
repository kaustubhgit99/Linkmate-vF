'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bed, Heart, ArrowLeft, CheckCircle, Shield, ChevronLeft, ChevronRight, Share2, X, Phone, Send, Loader2, User } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { getSupabase } from '@/lib/supabase'
import { useAuth, useFavorites } from '@/lib/hooks'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

function ContactModal({ owner, roomTitle, roomId, onClose }: { owner: any; roomTitle: string; roomId: string; onClose: () => void }) {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    name: profile?.full_name || '',
    phone: profile?.phone || '',
    message: `Hi, I am interested in "${roomTitle}". Please contact me.`
  })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = useRef(getSupabase()).current

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setLoading(true)
    const { error } = await supabase.from('enquiries').insert({
      room_id: roomId,
      owner_id: owner.id,
      sender_id: user?.id || null,
      sender_name: form.name,
      sender_phone: form.phone,
      message: form.message,
    })
    if (error) {
      toast({ title: 'Failed to send', description: error.message, variant: 'destructive' })
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 48 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="bg-white w-full sm:max-w-[440px] rounded-t-[28px] sm:rounded-[24px] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#E4E4E2]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#141414] flex items-center justify-center text-white font-semibold text-[15px]">
              {owner.full_name?.charAt(0) || '?'}
            </div>
            <div>
              <p className="font-semibold text-[14px] text-[#141414]">{owner.full_name}</p>
              <div className="flex items-center gap-1 text-[11px] text-green-600 font-semibold mt-0.5">
                <Shield className="w-3 h-3"/>Verified Owner
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2F2F0] flex items-center justify-center text-[#5A5A58] hover:bg-[#E4E4E2] transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>

        <div className="px-6 py-5">
          {sent ? (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600"/>
              </div>
              <h3 className="font-display text-[#141414] text-[1.35rem] mb-1.5">Enquiry Sent!</h3>
              <p className="text-[13.5px] text-[#5A5A58] mb-1">
                Message sent to <strong className="text-[#141414]">{owner.full_name}</strong>.
              </p>
              <p className="text-[13px] text-[#5A5A58] mb-7">They will contact you at your phone number.</p>
              {owner.phone && (
                <a href={`tel:${owner.phone}`} className="btn btn-dark px-6 py-2.5 text-[13.5px] w-full justify-center">
                  <Phone className="w-4 h-4"/> Call Owner Now
                </a>
              )}
            </div>
          ) : (
            <>
              <p className="text-[13.5px] text-[#5A5A58] mb-5">
                Fill in your details and the owner will contact you directly.
              </p>
              <form onSubmit={send} className="space-y-4">
                <div>
                  <label className="field-label">Your Name</label>
                  <div className="input-group">
                    <User className="input-icon"/>
                    <input
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Full Name"
                      required
                      className="field field-icon-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="field-label">Phone Number</label>
                  <div className="input-group">
                    <Phone className="input-icon"/>
                    <input
                      value={form.phone}
                      onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      type="tel"
                      required
                      className="field field-icon-left"
                    />
                  </div>
                </div>
                <div>
                  <label className="field-label">Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    rows={3}
                    required
                    className="field"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-dark w-full justify-center py-3 mt-1 text-[14px]">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin"/>Sending...</> : <><Send className="w-4 h-4"/>Send Enquiry</>}
                </button>
                {!user && (
                  <p className="text-center text-[12px] text-[#A0A09E] pt-0.5">
                    <Link href="/auth/login" className="font-semibold text-[#141414]">Sign in</Link> to track your enquiries
                  </p>
                )}
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default function RoomDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imgIdx, setImgIdx] = useState(0)
  const [showContact, setShowContact] = useState(false)
  const { user } = useAuth()
  const { favorites, toggleFavorite } = useFavorites(user?.id)
  const supabase = useRef(getSupabase()).current

  useEffect(() => {
    supabase.from('rooms').select('*,room_images(*),users(id,full_name,phone,avatar_url)').eq('id', params.id).single()
      .then(({ data }) => { setRoom(data); setLoading(false) })
  }, [params.id, supabase])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <div className="w-9 h-9 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"/>
    </div>
  )

  if (!room) return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <div className="pt-28 text-center px-4">
        <h2 className="font-display text-[1.6rem] text-[#141414] mb-3">Room not found</h2>
        <p className="text-[#5A5A58] text-[14px] mb-6">This listing may have been removed.</p>
        <Link href="/browse"><span className="btn btn-dark px-6 py-3">Browse Rooms</span></Link>
      </div>
    </div>
  )

  const imgs = room.room_images || []
  const isFav = favorites.includes(room.id)
  const share = () => { navigator.clipboard?.writeText(window.location.href); toast({ title: 'Link copied!' }) }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <AnimatePresence>
        {showContact && room.users && (
          <ContactModal owner={room.users} roomTitle={room.title} roomId={room.id} onClose={() => setShowContact(false)}/>
        )}
      </AnimatePresence>

      <div className="pt-[64px] max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-8">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] text-[#5A5A58] hover:text-[#141414] mb-6 transition-colors group font-medium">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"/> Back to listings
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-5">
            {/* Gallery */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <div className="relative h-64 sm:h-[420px] rounded-[20px] overflow-hidden bg-[#F2F2F0]">
                {imgs.length > 0 ? (
                  <Image src={imgs[imgIdx]?.url} alt={room.title} fill className="object-cover transition-all duration-400"/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#D0D0CE]">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className={`badge ${room.is_available ? 'badge-green' : 'badge-amber'}`}>
                    {room.is_available ? '● Available' : '○ Occupied'}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  {user && (
                    <button onClick={() => toggleFavorite(room.id)}
                      className={`w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isFav ? 'text-red-500' : 'text-[#A0A09E]'}`}>
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`}/>
                    </button>
                  )}
                  <button onClick={share} className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-[#5A5A58] hover:text-[#141414] transition-all hover:scale-110">
                    <Share2 className="w-4 h-4"/>
                  </button>
                </div>
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setImgIdx(i => (i - 1 + imgs.length) % imgs.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors">
                      <ChevronLeft className="w-5 h-5 text-[#141414]"/>
                    </button>
                    <button onClick={() => setImgIdx(i => (i + 1) % imgs.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center hover:bg-white transition-colors">
                      <ChevronRight className="w-5 h-5 text-[#141414]"/>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imgs.map((_: any, i: number) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          className={`rounded-full transition-all ${i === imgIdx ? 'w-5 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}/>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {imgs.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {imgs.map((img: any, i: number) => (
                    <button key={img.id} onClick={() => setImgIdx(i)}
                      className={`relative w-16 h-11 rounded-[12px] overflow-hidden shrink-0 transition-all ${i === imgIdx ? 'ring-2 ring-[#141414]' : 'opacity-50 hover:opacity-80'}`}>
                      <Image src={img.url} alt="" fill className="object-cover"/>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details card */}
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-[20px] border border-[#E4E4E2] p-6" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="font-display text-[#141414] mb-1.5 leading-tight" style={{ fontSize: 'clamp(1.35rem, 3vw, 1.8rem)' }}>
                    {room.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-[13px] text-[#5A5A58]">
                    <MapPin className="w-3.5 h-3.5 text-[#A0A09E]"/>
                    {room.location}, {room.city}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-[1.5rem] text-[#141414] leading-none">{formatPrice(room.rent_price)}</div>
                  <div className="text-[12px] text-[#A0A09E] mt-1">/month</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-5">
                <span className="chip"><Bed className="w-3.5 h-3.5"/> {room.num_beds} Bed{room.num_beds > 1 ? 's' : ''}</span>
                <span className="chip">{room.room_type}</span>
                <span className="chip">{formatDate(room.created_at)}</span>
              </div>

              <div className="divider mb-5"/>

              <h3 className="font-semibold text-[14.5px] text-[#141414] mb-2.5">About this room</h3>
              <p className="text-[14px] text-[#5A5A58] leading-relaxed">{room.description || 'No description provided.'}</p>

              {room.amenities?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold text-[14.5px] text-[#141414] mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((a: string) => (
                      <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F7F6] border border-[#E4E4E2] rounded-full text-[12.5px] font-medium text-[#141414]">
                        <CheckCircle className="w-3 h-3 text-green-600 shrink-0"/>{a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div>
            <motion.div initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="bg-white rounded-[20px] border border-[#E4E4E2] p-6 sticky top-[80px]" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <h3 className="font-semibold text-[14.5px] text-[#141414] mb-4">Owner Details</h3>

              {room.users ? (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-full bg-[#141414] flex items-center justify-center text-white font-semibold text-[16px]">
                      {room.users.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-semibold text-[14px] text-[#141414]">{room.users.full_name}</div>
                      <div className="flex items-center gap-1 text-[11px] text-green-600 font-semibold mt-0.5">
                        <Shield className="w-3 h-3"/>Verified Owner
                      </div>
                    </div>
                  </div>

                  {room.users.phone && (
                    <a href={`tel:${room.users.phone}`}
                      className="flex items-center gap-3 p-3 rounded-[12px] bg-[#F7F7F6] border border-[#E4E4E2] hover:border-[#CECECE] transition-colors text-[13px] font-medium text-[#141414] mb-4">
                      <Phone className="w-4 h-4 text-green-600 shrink-0"/>{room.users.phone}
                    </a>
                  )}

                  <div className="divider mb-4"/>

                  <div className="space-y-3 text-[13px] mb-5">
                    {[
                      ['Type', room.room_type],
                      ['Beds', String(room.num_beds)],
                      ['City', room.city],
                      ['Status', room.is_available ? 'Available' : 'Occupied'],
                      ['Rent/mo', formatPrice(room.rent_price)]
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between items-center">
                        <span className="text-[#A0A09E] font-medium">{k}</span>
                        <span className={`font-semibold ${
                          k === 'Status' ? (room.is_available ? 'text-green-600' : 'text-amber-600') : 'text-[#141414]'
                        }`}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={() => setShowContact(true)} className="btn btn-dark w-full justify-center py-3 text-[14px]">
                    Contact Owner
                  </button>
                  {!user && (
                    <p className="text-center text-[12px] text-[#A0A09E] mt-3">
                      <Link href="/auth/login" className="font-semibold text-[#141414]">Sign in</Link> to save this room
                    </p>
                  )}
                </>
              ) : (
                <p className="text-[13px] text-[#5A5A58]">Owner info not available</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
