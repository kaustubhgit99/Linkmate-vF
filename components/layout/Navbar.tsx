'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X, LayoutDashboard, LogOut, Heart, Plus, Shield, ChevronDown } from 'lucide-react'
import { useAuth } from '@/lib/hooks'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const onHero = pathname === '/'

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  const handleSignOut = async () => { await signOut(); router.push('/') }
  const dashLink = profile?.role === 'admin' ? '/admin' : profile?.role === 'owner' ? '/owner' : '/browse'
  const initial = (profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()

  const isTransparent = onHero && !scrolled
  const navBg = isTransparent
    ? 'bg-transparent border-transparent'
    : 'bg-white/96 backdrop-blur-lg border-b border-[#E4E4E2] shadow-[0_1px_12px_rgba(0,0,0,0.05)]'
  const textColor = isTransparent ? 'text-white' : 'text-[#141414]'
  const mutedColor = isTransparent ? 'text-white/70' : 'text-[#5A5A58]'

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 border-b ${navBg}`}>
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 h-[64px] flex items-center justify-between gap-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center transition-all ${isTransparent ? 'bg-white/15 backdrop-blur-sm border border-white/20' : 'bg-[#141414]'}`}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className={`font-display text-[18px] transition-colors leading-none ${textColor}`}>
            LinkMate
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-1 flex-1">
          {[{ href: '/', label: 'Home' }, { href: '/browse', label: 'Browse Rooms' }].map(l => {
            const isActive = pathname === l.href
            return (
              <Link key={l.href} href={l.href}
                className={`nav-pill transition-all ${isTransparent
                  ? (isActive ? 'text-white font-semibold' : 'text-white/70 hover:text-white hover:bg-white/10')
                  : (isActive ? 'text-[#141414] font-semibold bg-[#F2F2F0]' : '')
                }`}>
                {l.label}
              </Link>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!loading && (user ? (
            <>
              {profile?.role === 'owner' && (
                <Link href="/owner/add" className="hidden sm:flex">
                  <span className={`btn text-[13px] py-[9px] px-[18px] rounded-full font-semibold transition-all ${
                    isTransparent
                      ? 'bg-white/15 text-white border border-white/25 hover:bg-white/22 backdrop-blur-sm'
                      : 'btn-dark'
                  }`}>
                    <Plus className="w-3.5 h-3.5"/> List Room
                  </span>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className={`flex items-center gap-2 rounded-full px-2 py-1.5 transition-all hover:opacity-80 ${isTransparent ? 'hover:bg-white/10' : 'hover:bg-[#F2F2F0]'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${isTransparent ? 'bg-white/20 text-white border border-white/30' : 'bg-[#141414] text-white'}`}>
                      {initial}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-colors ${mutedColor}`}/>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 rounded-[16px] border-[#E4E4E2] shadow-xl p-1.5 bg-white mt-1">
                  <div className="px-3 py-2.5 mb-0.5 border-b border-[#F2F2F0]">
                    <p className="font-semibold text-[13px] text-[#141414] truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-[11px] text-[#A0A09E] capitalize mt-0.5">{profile?.role}</p>
                  </div>
                  <div className="pt-0.5">
                    <DropdownMenuItem asChild>
                      <Link href={dashLink} className="flex items-center gap-2.5 text-[13px] rounded-[10px] px-3 py-2.5 cursor-pointer text-[#5A5A58] hover:text-[#141414]">
                        <LayoutDashboard className="w-3.5 h-3.5"/> Dashboard
                      </Link>
                    </DropdownMenuItem>
                    {profile?.role === 'citizen' && (
                      <DropdownMenuItem asChild>
                        <Link href="/browse/favorites" className="flex items-center gap-2.5 text-[13px] rounded-[10px] px-3 py-2.5 cursor-pointer text-[#5A5A58] hover:text-[#141414]">
                          <Heart className="w-3.5 h-3.5"/> Saved Rooms
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {profile?.role === 'owner' && (
                      <DropdownMenuItem asChild>
                        <Link href="/owner/add" className="flex items-center gap-2.5 text-[13px] rounded-[10px] px-3 py-2.5 cursor-pointer text-[#5A5A58] hover:text-[#141414]">
                          <Plus className="w-3.5 h-3.5"/> Add Room
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {profile?.role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2.5 text-[13px] rounded-[10px] px-3 py-2.5 cursor-pointer text-[#5A5A58] hover:text-[#141414]">
                          <Shield className="w-3.5 h-3.5"/> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="my-1 bg-[#F2F2F0]"/>
                    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2.5 text-[13px] rounded-[10px] px-3 py-2.5 cursor-pointer text-red-500 focus:text-red-500 focus:bg-red-50">
                      <LogOut className="w-3.5 h-3.5"/> Sign Out
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/auth/login">
                <span className={`btn nav-pill font-semibold text-[13px] transition-all ${isTransparent ? 'text-white/80 hover:text-white hover:bg-white/10' : ''}`}>
                  Sign In
                </span>
              </Link>
              <Link href="/auth/signup">
                <span className={`btn text-[13px] py-[9px] px-[18px] rounded-full font-semibold transition-all ${
                  isTransparent
                    ? 'bg-white text-[#141414] hover:bg-white/90 shadow-sm'
                    : 'btn-dark'
                }`}>
                  Get Started
                </span>
              </Link>
            </div>
          ))}
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 rounded-[10px] transition-colors ${isTransparent ? 'text-white hover:bg-white/10' : 'text-[#5A5A58] hover:bg-[#F2F2F0]'}`}>
            {open ? <X className="w-5 h-5"/> : <Menu className="w-5 h-5"/>}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="md:hidden bg-white border-t border-[#E4E4E2] px-4 py-3 shadow-lg">
            <div className="space-y-0.5">
              {[{ href: '/', label: 'Home' }, { href: '/browse', label: 'Browse Rooms' }].map(l => (
                <Link key={l.href} href={l.href}
                  className={`block px-4 py-3 rounded-[10px] text-[14px] font-medium transition-colors ${
                    pathname === l.href
                      ? 'bg-[#F2F2F0] text-[#141414] font-semibold'
                      : 'text-[#5A5A58] hover:bg-[#F7F7F6] hover:text-[#141414]'
                  }`}>
                  {l.label}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href={dashLink} className="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-[#5A5A58] hover:bg-[#F7F7F6] hover:text-[#141414]">
                    Dashboard
                  </Link>
                  {profile?.role === 'owner' && (
                    <Link href="/owner/add" className="block px-4 py-3 rounded-[10px] text-[14px] font-medium text-[#5A5A58] hover:bg-[#F7F7F6]">
                      List a Room
                    </Link>
                  )}
                  <div className="pt-1">
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-[10px] text-[14px] font-medium text-red-500 hover:bg-red-50">
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link href="/auth/login" className="flex-1">
                    <span className="btn btn-outline w-full text-[13px] justify-center py-3">Sign In</span>
                  </Link>
                  <Link href="/auth/signup" className="flex-1">
                    <span className="btn btn-dark w-full text-[13px] justify-center py-3">Get Started</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
