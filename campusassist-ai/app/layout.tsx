import type { Metadata } from "next"
import "./globals.css"
import Link from "next/link"
import { RoleProvider } from "@/components/RoleToggle"
import { StudentViewButton } from "@/components/StudentViewButton"

export const metadata: Metadata = {
  title: "PUPila - Enrollment can be easier",
  description: "AI-guided enrollment portal for PUP students",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-gray-800 bg-white overflow-x-hidden antialiased">
        <RoleProvider>

          {/* Top strip */}
          <div className="relative bg-brand-crimson text-white text-[11px] font-semibold">
            <div className="absolute left-0 inset-y-0 w-44 md:w-64 bg-brand-gold notch hidden sm:block" />
            <div className="relative flex justify-between items-center px-4 md:px-12 py-2.5">
              <div className="hidden sm:flex items-center gap-2 text-brand-navy font-bold">
                Follow Us
                <span className="w-5 h-5 rounded-full bg-brand-crimson text-white text-[9px] flex items-center justify-center">f</span>
                <span className="w-5 h-5 rounded-full bg-brand-crimson text-white text-[9px] flex items-center justify-center">ig</span>
                <span className="w-5 h-5 rounded-full bg-brand-crimson text-white text-[9px] flex items-center justify-center">in</span>
              </div>
              <div className="flex items-center gap-5 ml-auto">
                <span>📞 (02) 8316-7222 / 8330-7300</span>
                <span className="hidden md:inline opacity-40">|</span>
                <span className="hidden md:inline">✉ info@PUPilaassist.edu.ph</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
            <div className="max-w-7xl mx-auto px-4 md:px-12 py-3 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3" aria-label="PUPila home">
                {/* Logo text fallback (SVG/image logo would need local asset) */}
                <div className="w-[54px] h-11 bg-brand-crimson rounded-lg flex items-center justify-center shadow">
                  <svg className="w-7 h-7 text-brand-gold" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="leading-tight">
                  <span className="block text-lg font-extrabold tracking-tight text-brand-crimson">PUPila</span>
                  <span className="block text-[9px] font-bold tracking-wide text-brand-crimson mt-0.5">
                    Your PUP Enrollment, Made Easier
                  </span>
                </span>
              </Link>

              <nav className="flex items-center gap-6 text-xs font-bold text-gray-700">
                <div className="hidden md:flex gap-6">
                  <Link href="/enroll" className="text-brand-crimson border-b-2 border-brand-crimson pb-1">Enroll</Link>
                  <Link href="/chat" className="hover:text-brand-crimson transition">Ask AI</Link>
                  <Link href="/admin" className="hover:text-brand-crimson transition">Admin</Link>
                </div>
                <StudentViewButton />
              </nav>
            </div>
          </header>

          {children}

        </RoleProvider>
      </body>
    </html>
  )
}
