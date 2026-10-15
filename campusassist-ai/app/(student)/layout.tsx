import Link from "next/link"
import { RoleToggle } from "@/components/RoleToggle"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-[#9B1B1B] text-white flex items-center justify-between px-6 h-14 sticky top-0 z-20 shadow-md shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
          <span className="text-xl font-extrabold tracking-[0.18em] uppercase">PUPILA</span>
        </Link>
        <div className="flex items-center gap-3">
          <RoleToggle />
          <span className="w-8 h-8 rounded-full border-2 border-white/40 bg-[#7a1515] flex items-center justify-center" aria-hidden="true">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </span>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden md:flex w-44 bg-[#9B1B1B] text-white flex-col pt-8 shrink-0 min-h-[calc(100vh-3.5rem)]">
          <div className="mx-4 mb-6 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70">1st Semester</p>
            <p className="text-[11px] font-bold">AY 2025–2026</p>
          </div>
          <nav className="flex flex-col gap-0.5 px-2 text-sm font-semibold">
            <Link href="/" className="px-3 py-2.5 rounded-lg hover:bg-white/10">Home</Link>
            <Link href="/enroll" className="px-3 py-2.5 rounded-lg hover:bg-white/10">Enroll</Link>
            <Link href="/chat" className="px-3 py-2.5 rounded-lg hover:bg-white/10">Ask AI</Link>
            <Link href="/admin" className="px-3 py-2.5 rounded-lg hover:bg-white/10">Admin</Link>
          </nav>
          <div className="mt-auto mx-4 mb-6 pt-4 border-t border-white/20 text-[10px] text-white/60 text-center">
            Enrollment Portal
          </div>
        </aside>
        <main className="flex-1 min-w-0 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
