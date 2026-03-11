'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, HomeIcon, Eye, Edit3, Trash2, ToggleLeft, ToggleRight, TrendingUp, DollarSign, MessageSquare, Phone, Clock, CheckCheck } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks'
import { formatPrice, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

type Tab = 'listings' | 'enquiries'

export default function OwnerDashboard() {
  const [rooms, setRooms] = useState<any[]>([])
  const [enquiries, setEnquiries] = useState<any[]>([])
  const [roomsLoading, setRoomsLoading] = useState(true)
  const [enquiriesLoading, setEnquiriesLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('listings')
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = useRef(getSupabase()).current
  const router = useRouter()
  const fetchedRef = useRef(false)

  const fetchRooms = useCallback(async (uid: string) => {
    const { data } = await supabase.from('rooms').select('*,room_images(*)').eq('owner_id', uid).order('created_at', { ascending: false })
    setRooms(data || []); setRoomsLoading(false)
  }, [supabase])

  const fetchEnquiries = useCallback(async (uid: string) => {
    const { data } = await supabase.from('enquiries')
      .select('*,rooms(title,city)')
      .eq('owner_id', uid)
      .order('created_at', { ascending: false })
    setEnquiries(data || []); setEnquiriesLoading(false)
  }, [supabase])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.replace('/auth/login'); return }
    if (profile && profile.role !== 'owner' && profile.role !== 'admin') { router.replace('/browse'); return }
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchRooms(user.id)
      fetchEnquiries(user.id)
    }
  }, [authLoading, user, profile, fetchRooms, fetchEnquiries, router])

  const markRead = async (id: string) => {
    await supabase.from('enquiries').update({ is_read: true }).eq('id', id)
    setEnquiries(p => p.map(e => e.id === id ? { ...e, is_read: true } : e))
  }

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 border-[#141414] border-t-transparent rounded-full animate-spin"/>
    </div>
  )
  if (!user) return null

  const unreadCount = enquiries.filter(e => !e.is_read).length
  const stats = [
    { l: 'Total Listings', v: rooms.length, icon: HomeIcon, c: 'text-[#141414]', bg: 'bg-[#F2F2F0]' },
    { l: 'Available', v: rooms.filter(r => r.is_available).length, icon: TrendingUp, c: 'text-green-600', bg: 'bg-green-50' },
    { l: 'Occupied', v: rooms.filter(r => !r.is_available).length, icon: HomeIcon, c: 'text-amber-600', bg: 'bg-amber-50' },
    { l: 'Monthly Value', v: formatPrice(rooms.filter(r => r.is_available).reduce((s, r) => s + r.rent_price, 0)), icon: DollarSign, c: 'text-[#141414]', bg: 'bg-[#F2F2F0]' },
  ]

  const deleteRoom = async (id: string) => {
    if (!confirm('Delete this listing?')) return
    await supabase.from('rooms').delete().eq('id', id)
    setRooms(p => p.filter(r => r.id !== id))
    toast({ title: 'Room deleted' })
  }
  const toggleAvail = async (id: string, cur: boolean) => {
    await supabase.from('rooms').update({ is_available: !cur }).eq('id', id)
    setRooms(p => p.map(r => r.id === id ? { ...r, is_available: !cur } : r))
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar/>
      <div className="pt-[64px] max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-[#141414]" style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)' }}>Dashboard</h1>
            <p className="text-[13.5px] text-[#5A5A58] mt-1">Welcome back, {profile?.full_name?.split(' ')[0] || 'Owner'}</p>
          </div>
          <Link href="/owner/add">
            <span className="btn btn-dark px-5 py-3 text-[13.5px]"><Plus className="w-4 h-4"/> Add New Room</span>
          </Link>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-[18px] p-5 border border-[#E4E4E2]" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <div className={`w-10 h-10 rounded-[12px] ${s.bg} flex items-center justify-center mb-3`}>
                <s.icon className={`w-5 h-5 ${s.c}`}/>
              </div>
              <div className="font-display text-[1.55rem] text-[#141414] leading-none">{s.v}</div>
              <div className="text-[12px] text-[#A0A09E] mt-1.5 font-medium">{s.l}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-5 bg-white rounded-[14px] border border-[#E4E4E2] p-1.5 w-fit" style={{ boxShadow: 'var(--shadow-xs)' }}>
          {[
            { id: 'listings' as Tab, label: 'My Listings', count: rooms.length },
            { id: 'enquiries' as Tab, label: 'Enquiries', count: unreadCount > 0 ? unreadCount : null, badge: unreadCount > 0 },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13.5px] font-semibold transition-all ${tab === t.id ? 'bg-[#141414] text-white shadow-sm' : 'text-[#5A5A58] hover:text-[#141414]'}`}>
              {t.label}
              {t.count !== null && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? (t.badge ? 'bg-white text-[#141414]' : 'bg-white/20 text-white') : (t.badge ? 'bg-[#141414] text-white' : 'bg-[#F2F2F0] text-[#5A5A58]')}`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Listings table */}
        {tab === 'listings' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[18px] border border-[#E4E4E2] overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <div className="px-6 py-4 border-b border-[#E4E4E2] flex items-center justify-between">
              <h2 className="font-semibold text-[15px] text-[#141414]">All Listings</h2>
              <span className="text-[12px] text-[#A0A09E] font-medium">{rooms.length} total</span>
            </div>

            {roomsLoading ? (
              <div className="p-12 text-center text-[#A0A09E] text-[13.5px]">Loading your listings...</div>
            ) : rooms.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-[18px] bg-[#F2F2F0] border border-[#E4E4E2] flex items-center justify-center mx-auto mb-4">
                  <HomeIcon className="w-7 h-7 text-[#D0D0CE]"/>
                </div>
                <p className="font-semibold text-[#141414] mb-1.5">No listings yet</p>
                <p className="text-[13.5px] text-[#5A5A58] mb-6">Add your first room to start getting enquiries</p>
                <Link href="/owner/add"><span className="btn btn-dark px-6 py-3 text-[13.5px]"><Plus className="w-4 h-4"/> Add Your First Room</span></Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full data-table">
                  <thead>
                    <tr>
                      {['Room', 'City', 'Rent', 'Status', 'Photos', 'Actions'].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map(room => (
                      <tr key={room.id}>
                        <td>
                          <div className="font-semibold text-[#141414] line-clamp-1 max-w-[160px]">{room.title}</div>
                          <div className="text-[11px] text-[#A0A09E] mt-0.5">{room.room_type} · {room.num_beds} bed</div>
                        </td>
                        <td className="text-[#5A5A58]">{room.city}</td>
                        <td className="font-bold text-[#141414]">{formatPrice(room.rent_price)}</td>
                        <td>
                          <button onClick={() => toggleAvail(room.id, room.is_available)} className="flex items-center gap-2 group">
                            {room.is_available
                              ? <ToggleRight className="w-5 h-5 text-green-500"/>
                              : <ToggleLeft className="w-5 h-5 text-[#D0D0CE]"/>
                            }
                            <span className={`badge ${room.is_available ? 'badge-green' : 'badge-amber'}`}>
                              {room.is_available ? 'Available' : 'Occupied'}
                            </span>
                          </button>
                        </td>
                        <td className="text-[#A0A09E]">{room.room_images?.length || 0}</td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Link href={`/room/${room.id}`}>
                              <button className="btn btn-ghost p-2 rounded-[10px]"><Eye className="w-4 h-4"/></button>
                            </Link>
                            <Link href={`/owner/edit/${room.id}`}>
                              <button className="btn btn-ghost p-2 rounded-[10px]"><Edit3 className="w-4 h-4"/></button>
                            </Link>
                            <button onClick={() => deleteRoom(room.id)} className="btn btn-ghost p-2 rounded-[10px] hover:bg-red-50 hover:text-red-500">
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Enquiries */}
        {tab === 'enquiries' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {enquiriesLoading ? (
              <div className="bg-white rounded-[18px] border border-[#E4E4E2] p-12 text-center text-[#A0A09E] text-[13.5px]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                Loading enquiries...
              </div>
            ) : enquiries.length === 0 ? (
              <div className="bg-white rounded-[18px] border border-[#E4E4E2] p-16 text-center" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <div className="w-14 h-14 rounded-[18px] bg-[#F2F2F0] border border-[#E4E4E2] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-[#D0D0CE]"/>
                </div>
                <p className="font-semibold text-[#141414] mb-1.5">No enquiries yet</p>
                <p className="text-[13.5px] text-[#5A5A58]">When tenants send you messages, they'll appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {enquiries.map((enq, i) => (
                  <motion.div key={enq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`bg-white rounded-[18px] border p-5 transition-colors ${enq.is_read ? 'border-[#E4E4E2]' : 'border-[#141414]/15 bg-[#FAFAF9]'}`}
                    style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold shrink-0 ${enq.is_read ? 'bg-[#F2F2F0] text-[#5A5A58]' : 'bg-[#141414] text-white'}`}>
                          {enq.sender_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-[14px] text-[#141414]">{enq.sender_name}</span>
                            {!enq.is_read && <span className="badge badge-dark text-[9px] py-0.5 px-2">New</span>}
                          </div>
                          <div className="text-[12px] text-[#A0A09E] mb-2 font-medium">
                            {enq.rooms?.title ? `Re: ${enq.rooms.title}` : 'General enquiry'}
                            {enq.rooms?.city && ` · ${enq.rooms.city}`}
                          </div>
                          <p className="text-[13.5px] text-[#5A5A58] leading-relaxed">{enq.message}</p>
                          <div className="flex items-center gap-4 mt-3">
                            <a href={`tel:${enq.sender_phone}`} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-[#141414] hover:opacity-70 transition-opacity">
                              <Phone className="w-3.5 h-3.5"/> {enq.sender_phone}
                            </a>
                            <span className="flex items-center gap-1 text-[11.5px] text-[#A0A09E]">
                              <Clock className="w-3 h-3"/> {formatDate(enq.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      {!enq.is_read && (
                        <button onClick={() => markRead(enq.id)}
                          className="btn btn-ghost py-1.5 px-3 text-[11.5px] text-[#5A5A58] hover:text-[#141414] shrink-0 gap-1.5">
                          <CheckCheck className="w-3.5 h-3.5"/> Mark read
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
