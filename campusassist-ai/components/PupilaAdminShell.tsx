"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Inbox,
  BarChart2,
  GraduationCap,
  Menu,
  X,
  MessageCircle,
  Zap,
  User,
} from "lucide-react"
import { RoleToggle } from "@/components/RoleToggle"
import { ChatWindow } from "@/components/ChatWindow"

// ── PupilaAdminShell ─────────────────────────────────────────────────

interface PupilaAdminShellProps {
  children: React.ReactNode
}

export function PupilaAdminShell({ children }: PupilaAdminShellProps) {
  const pathname      = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiOpen,      setAiOpen]      = useState(true)

  // AI panel shown on dashboard (/admin) and requests only
  const showAiPanel = pathname === "/admin" || pathname.startsWith("/admin/requests")

  return (
    <div className="min-h-screen bg-pupila-bg flex flex-col">

      {/* ── Top header ──────────────────────────────────────────────── */}
      <header className="h-16 bg-pupila-card border-b border-pupila-line flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">

        {/* Left: hamburger (mobile) + brand */}
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-pupila-mute hover:text-pupila-ink transition-colors"
            onClick={() => setSidebarOpen(s => !s)}
            aria-label="Toggle navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            {/* PUPILA brand mark — red square with cap icon */}
            <span className="w-8 h-8 rounded-[9px] bg-pupila-brand flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </span>
            <span className="font-semibold tracking-[0.14em] text-[15px] text-pupila-ink uppercase select-none">
              PUPILA
            </span>
          </div>
        </div>

        {/* Right: role toggle + AI panel toggle + avatar */}
        <div className="flex items-center gap-2.5">
          <RoleToggle />
          {showAiPanel && (
            <button
              className="hidden xl:flex items-center justify-center w-8 h-8 rounded-full text-pupila-mute hover:text-pupila-ink hover:bg-pupila-soft transition-colors"
              onClick={() => setAiOpen(o => !o)}
              aria-label="Toggle AI assistant"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          )}
          <span className="w-9 h-9 rounded-full bg-pupila-soft border border-pupila-line flex items-center justify-center text-pupila-mute">
            <User className="w-4 h-4" />
          </span>
        </div>
      </header>

      {/* ── Body row ────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside
          className={[
            "fixed top-16 bottom-0 left-0 z-20 w-[232px] bg-pupila-card border-r border-pupila-line flex flex-col",
            "transition-transform duration-200 ease-in-out",
            "md:translate-x-0 md:static md:top-auto md:bottom-auto md:z-auto md:flex md:shrink-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* Semester context */}
          <div className="px-4 pt-5 pb-1">
            <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-pupila-mute">
              1ST SEMESTER&nbsp;&nbsp;|&nbsp;&nbsp;AY 2025–2026
            </p>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-0.5 px-3.5 mt-3 flex-1">

            {/* Dashboard */}
            <Link
              href="/admin"
              onClick={() => setSidebarOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors mb-0.5",
                pathname === "/admin"
                  ? "bg-pupila-tint text-pupila-brand"
                  : "text-pupila-mute hover:bg-pupila-soft hover:text-pupila-ink",
              ].join(" ")}
            >
              <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />
              Dashboard
            </Link>

            {/* Requests — live link with pending count */}
            <Link
              href="/admin/requests"
              onClick={() => setSidebarOpen(false)}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors mb-0.5",
                pathname.startsWith("/admin/requests")
                  ? "bg-pupila-tint text-pupila-brand"
                  : "text-pupila-mute hover:bg-pupila-soft hover:text-pupila-ink",
              ].join(" ")}
            >
              <Inbox className="w-[18px] h-[18px] shrink-0" />
              Requests
            </Link>

            {/* Reports — Phase 4: disabled until page exists */}
            <span
              className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium text-pupila-mute/40 cursor-default select-none mb-0.5"
              aria-disabled="true"
              title="Coming in Phase 4"
            >
              <BarChart2 className="w-[18px] h-[18px] shrink-0" />
              Reports
            </span>
          </nav>

          {/* Footer */}
          <div className="px-4 pb-4 pt-3 border-t border-pupila-line mt-auto">
            <p className="text-xs text-pupila-mute">Enrollment Portal</p>
          </div>
        </aside>

        {/* ── Content area ────────────────────────────────────────── */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-pupila-bg">
          <div className="px-4 py-7 md:px-[48px] md:py-[44px]">
            {children}
          </div>
        </main>

        {/* ── AI panel — dashboard + requests only, xl screens ─────── */}
        {showAiPanel && aiOpen && (
          <aside className="hidden xl:flex flex-col w-[340px] shrink-0 bg-pupila-card border-l border-pupila-line">
            {/* Panel header */}
            <div className="flex items-center gap-3 px-5 py-[18px] border-b border-pupila-line">
              <span className="w-[38px] h-[38px] rounded-[11px] bg-pupila-brand flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold text-pupila-ink leading-tight">PUPILA AI Assistant</p>
                <p className="text-xs text-pupila-mute truncate">Powered by CampusAssist</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-pupila-green bg-[#e7f5ee] rounded-full px-2.5 py-1 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-pupila-green" />
                Online
              </span>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-hidden">
              <ChatWindow />
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs text-pupila-mute px-4 py-3 border-t border-pupila-line">
              Answers from curated enrollment content only
            </p>
          </aside>
        )}
      </div>
    </div>
  )
}
