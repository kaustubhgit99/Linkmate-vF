'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Bed, Heart, ArrowUpRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { useFavorites } from '@/lib/hooks'

export function RoomCard({ room, userId, index = 0 }: { room: any; userId?: string; index?: number }) {
  const { favorites, toggleFavorite } = useFavorites(userId)
  const isFav = favorites.includes(room.id)
  const img = room.room_images?.find((i: any) => i.is_primary) || room.room_images?.[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="card-hover group">
      <div className="bg-white rounded-[18px] overflow-hidden border border-[#E4E4E2] h-full flex flex-col" style={{ boxShadow: 'var(--shadow-sm)' }}>
        {/* Image */}
        <div className="relative h-48 bg-[#F2F2F0] shrink-0 overflow-hidden">
          {img ? (
            <Image
              src={img.url}
              alt={room.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-[#D0D0CE]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          )}
          {/* Overlay gradient for better badge readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/12 to-transparent pointer-events-none"/>

          <div className="absolute top-3 left-3">
            <span className={`badge ${room.is_available ? 'badge-green' : 'badge-amber'}`}>
              {room.is_available ? '● Available' : '○ Occupied'}
            </span>
          </div>

          {userId && (
            <button
              onClick={e => { e.preventDefault(); toggleFavorite(room.id) }}
              className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${isFav ? 'text-red-500' : 'text-[#A0A09E] hover:text-red-400'}`}
              style={{ boxShadow: 'var(--shadow)' }}>
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`}/>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="font-semibold text-[14px] text-[#141414] leading-snug line-clamp-2 flex-1 group-hover:text-[#1e1e1e]">
              {room.title}
            </h3>
            <div className="shrink-0 text-right">
              <div className="font-bold text-[15px] text-[#141414]">{formatPrice(room.rent_price)}</div>
              <div className="text-[11px] text-[#A0A09E]">/mo</div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[12px] text-[#5A5A58] mb-3">
            <MapPin className="w-3 h-3 shrink-0 text-[#A0A09E]"/>
            <span className="line-clamp-1">{room.location}, {room.city}</span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="chip text-[11px]"><Bed className="w-3 h-3"/> {room.num_beds} Bed{room.num_beds > 1 ? 's' : ''}</span>
            <span className="chip text-[11px]">{room.room_type}</span>
          </div>

          {room.amenities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {room.amenities.slice(0, 2).map((a: string) => (
                <span key={a} className="text-[10px] px-2 py-0.5 bg-[#F7F7F6] rounded-full text-[#5A5A58] border border-[#E4E4E2]">{a}</span>
              ))}
              {room.amenities.length > 2 && (
                <span className="text-[10px] px-2 py-0.5 bg-[#F7F7F6] rounded-full text-[#A0A09E] border border-[#E4E4E2]">+{room.amenities.length - 2} more</span>
              )}
            </div>
          )}

          <div className="mt-auto">
            <Link href={`/room/${room.id}`}>
              <span className="btn btn-dark w-full justify-center py-2.5 text-[13px] rounded-[10px] group-hover:shadow-md">
                View Details <ArrowUpRight className="w-3.5 h-3.5 opacity-70"/>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function RoomCardSkeleton() {
  return (
    <div className="bg-white rounded-[18px] overflow-hidden border border-[#E4E4E2]" style={{ boxShadow: 'var(--shadow-sm)' }}>
      <div className="h-48 shimmer"/>
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 shimmer rounded-full w-3/5"/>
          <div className="h-4 shimmer rounded-full w-1/5"/>
        </div>
        <div className="h-3 shimmer rounded-full w-2/5"/>
        <div className="flex gap-2">
          <div className="h-6 w-20 shimmer rounded-full"/>
          <div className="h-6 w-24 shimmer rounded-full"/>
        </div>
        <div className="h-9 shimmer rounded-[10px]"/>
      </div>
    </div>
  )
}
