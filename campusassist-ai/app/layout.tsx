import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Link from "next/link"
import { RoleProvider, RoleToggle } from "@/components/RoleToggle"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title:       "PUPILA · CampusAssist AI",
  description: "Student enrollment portal for BSIT",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F5F6FA] text-gray-900 antialiased flex flex-col font-sans">
        <RoleProvider>
          {/* ── Top header ── */}
          <header className="bg-[#9B1B1B] text-white flex items-center justify-between px-6 h-14 sticky top-0 z-20 shadow-md">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Cap icon */}
              <svg className="w-6 h-6 text-white/90 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
              </svg>
              <span className="text-xl font-extrabold tracking-[0.18em] uppercase leading-none select-none">
                PUPILA
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <RoleToggle />
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full border-2 border-white/40 bg-[#7a1515] flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            </div>
          </header>

          <div className="flex flex-1">
            {/* ── Left sidebar ── */}
            <aside className="w-44 bg-[#9B1B1B] text-white flex flex-col pt-8 shrink-0 min-h-[calc(100vh-3.5rem)] shadow-inner">
              {/* Semester badge */}
              <div className="mx-4 mb-6 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/70 leading-tight">1st Semester</p>
                <p className="text-[11px] font-bold text-white leading-tight">AY 2025–2026</p>
              </div>

              <nav className="flex flex-col gap-0.5 px-2">
                <Link
                  href="/"
                  className="flex items-center gap-2.5 font-semibold text-sm px-3 py-2.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-white/90 hover:text-white"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  Home
                </Link>
                <Link
                  href="/track"
                  className="flex items-center gap-2.5 font-semibold text-sm px-3 py-2.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-white/90 hover:text-white"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8"  y1="2" x2="8"  y2="6"/>
                    <line x1="3"  y1="10" x2="21" y2="10"/>
                  </svg>
                  Schedule
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 font-semibold text-sm px-3 py-2.5 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-white/90 hover:text-white"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                  </svg>
                  Admin
                </Link>
              </nav>

              {/* Bottom divider */}
              <div className="mt-auto mx-4 mb-6 pt-4 border-t border-white/20">
                <p className="text-[10px] text-white/40 text-center leading-relaxed">
                  BSIT Enrollment Portal
                </p>
              </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </RoleProvider>
      </body>
    </html>
  )
}
