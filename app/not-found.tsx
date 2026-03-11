import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-5" style={{ background: 'var(--bg)' }}>
      <div className="font-display text-[8rem] leading-none text-[#E4E4E2] mb-4">404</div>
      <h1 className="font-display text-[#141414] text-[1.8rem] mb-2">Page Not Found</h1>
      <p className="text-[#5A5A58] text-[14px] mb-8">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/"><span className="btn btn-dark px-8 py-3">Go Home</span></Link>
    </div>
  )
}
