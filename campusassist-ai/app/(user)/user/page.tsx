import Link from "next/link"
import { ChatWindow } from "@/components/ChatWindow"

export default function UserHomePage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)]">

      {/* ── Main content ── */}
      <div className="flex-1 min-w-0 px-10 py-10 overflow-y-auto">

        {/* Heading */}
        <h1 className="text-[34px] font-extrabold tracking-tight leading-tight text-gray-900 mb-2">
          Start your{" "}
          <span style={{ color: "#9B1B1B" }}>enrollment</span>
        </h1>
        <p className="text-[14px] text-gray-400 mb-8 max-w-md leading-relaxed">
          Choose your enrollment type to begin. You can track your status anytime with your{" "}
          <span className="font-bold" style={{ color: "#9B1B1B" }}>ENR number</span>.
        </p>

        {/* Enrollment cards */}
        <div className="flex gap-5 flex-wrap mb-8">

          {/* Regular Enrollment */}
          <Link
            href="/user/enroll?type=regular"
            className="group flex-1 min-w-[240px] max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            style={{ border: "1px solid #e5e7eb" }}
          >
            {/* Top color bar — crimson to gold */}
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #9B1B1B, #F5B400)" }} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#fdf0f0" }}>
                  <svg className="w-5 h-5" style={{ color: "#9B1B1B" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                </div>
                {/* Badge */}
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#dcfce7", color: "#15803d" }}>
                  Instant
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1.5">Regular Enrollment</h2>
              <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
                Auto-assigned subjects&nbsp;·&nbsp;Confirmed instantly
              </p>
              <div className="flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all" style={{ color: "#9B1B1B" }}>
                Enroll now
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
            </div>
          </Link>

          {/* Irregular Enrollment */}
          <Link
            href="/user/enroll?type=irregular"
            className="group flex-1 min-w-[240px] max-w-[320px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200"
            style={{ border: "1px solid #e5e7eb" }}
          >
            {/* Top color bar — crimson to gold */}
            <div className="h-1.5" style={{ background: "linear-gradient(90deg, #9B1B1B, #F5B400)" }} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "#fdf0f0" }}>
                  <svg className="w-5 h-5" style={{ color: "#9B1B1B" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h10M4 18h6"/>
                  </svg>
                </div>
                {/* Badge */}
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "#fef9c3", color: "#854d0e" }}>
                  Needs approval
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1.5">Irregular Enrollment</h2>
              <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
                Choose your subjects&nbsp;·&nbsp;Pending staff approval
              </p>
              <div className="flex items-center gap-1.5 text-sm font-bold group-hover:gap-2.5 transition-all" style={{ color: "#9B1B1B" }}>
                Enroll now
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Quick-link chips */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/user/track"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[13px] font-medium text-gray-600 hover:text-[#9B1B1B] transition-colors"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            Track enrollment
          </Link>
          <Link
            href="/user/chat"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-[13px] font-medium text-gray-600 hover:text-[#9B1B1B] transition-colors"
            style={{ border: "1px solid #e5e7eb" }}
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Ask AI about enrollment
          </Link>
        </div>
      </div>

      {/* ── AI Assistant panel ── */}
      <div
        className="hidden lg:flex flex-col w-[300px] xl:w-[320px] shrink-0"
        style={{ background: "#ffffff", borderLeft: "1px solid #e5e7eb" }}
      >
        {/* Panel header */}
        <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: "1px solid #f3f4f6" }}>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "#9B1B1B" }}
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 leading-tight">AI Assistant</p>
            <p className="text-[11px] text-gray-400 leading-tight">Powered by CampusAssist</p>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-semibold shrink-0" style={{ color: "#F5B400" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#F5B400" }} />
            Online
          </span>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
      </div>

    </div>
  )
}
