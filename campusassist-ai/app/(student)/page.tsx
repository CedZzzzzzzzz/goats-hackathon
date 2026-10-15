import Link from "next/link"
import { ChatWindow } from "@/components/ChatWindow"

export default function HomePage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* ── Left: main content ── */}
      <div className="flex-1 flex flex-col justify-center px-10 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9B1B1B] mb-1">
            BSIT · AY 2025–2026
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Start your enrollment
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Choose your enrollment type to begin. You can track your status anytime with your ENR number.
          </p>
        </div>

        {/* Enrollment cards */}
        <div className="flex gap-5 flex-wrap">
          {/* Regular Enrollment */}
          <Link
            href="/enroll?type=regular"
            className="group flex-1 min-w-[220px] max-w-[280px] bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-[#9B1B1B]/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-[#9B1B1B]/8 flex items-center justify-center mb-4 group-hover:bg-[#9B1B1B]/12 transition-colors">
              <svg className="w-5 h-5 text-[#9B1B1B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <h2 className="font-bold text-gray-900 text-base mb-1">Regular Enrollment</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Auto-assigned subjects&nbsp;·&nbsp;Confirmed instantly
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[#9B1B1B] text-xs font-semibold group-hover:gap-2.5 transition-all">
              Enroll now
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </div>
          </Link>

          {/* Irregular Enrollment */}
          <Link
            href="/enroll?type=irregular"
            className="group flex-1 min-w-[220px] max-w-[280px] bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-[#9B1B1B]/30 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
          >
            {/* Icon */}
            <div className="w-11 h-11 rounded-xl bg-[#9B1B1B]/8 flex items-center justify-center mb-4 group-hover:bg-[#9B1B1B]/12 transition-colors">
              <svg className="w-5 h-5 text-[#9B1B1B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6"/>
              </svg>
            </div>
            <h2 className="font-bold text-gray-900 text-base mb-1">Irregular Enrollment</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Choose your subjects&nbsp;·&nbsp;Pending staff approval
            </p>
            <div className="mt-5 flex items-center gap-1.5 text-[#9B1B1B] text-xs font-semibold group-hover:gap-2.5 transition-all">
              Enroll now
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
              </svg>
            </div>
          </Link>
        </div>

        {/* Quick links row */}
        <div className="mt-8 flex items-center gap-4">
          <Link href="/track" className="text-sm text-gray-500 hover:text-[#9B1B1B] transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            Track enrollment
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/chat" className="text-sm text-gray-500 hover:text-[#9B1B1B] transition-colors flex items-center gap-1.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Ask AI about enrollment
          </Link>
        </div>
      </div>

      {/* ── Right: AI assistant panel ── */}
      <div className="w-80 flex flex-col border-l border-gray-200 bg-white shrink-0">
        {/* Panel header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#9B1B1B]/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#9B1B1B]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 leading-tight">AI Assistant</p>
            <p className="text-[11px] text-gray-400 leading-tight">Powered by CampusAssist</p>
          </div>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"/>
            Online
          </span>
        </div>
        {/* Chat */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatWindow />
        </div>
      </div>
    </div>
  )
}
