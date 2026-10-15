"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import type { EnrollmentSummary } from "@/types"
import { useRole } from "@/components/RoleToggle"

interface Counts {
  total:     number
  pending:   number
  confirmed: number
  rejected:  number
  regular:   number
  irregular: number
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label:     string
  value:     number
  sub?:      string
  highlight?: boolean
}) {
  return (
    <div
      className={[
        "bg-pupila-card border rounded-[20px] px-6 py-[22px] min-w-0",
        highlight ? "border-pupila-gold" : "border-pupila-line",
      ].join(" ")}
    >
      <p className="text-[13px] text-pupila-mute">{label}</p>
      <p
        className={[
          "text-[38px] font-semibold tracking-[-0.03em] leading-[1.1] my-4",
          highlight ? "text-pupila-brand" : "text-pupila-ink",
        ].join(" ")}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-pupila-mute">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { isStaff }                          = useRole()
  const [enrollments, setEnrollments]        = useState<EnrollmentSummary[]>([])
  const [counts,      setCounts]             = useState<Counts | null>(null)
  const [loading,     setLoading]            = useState(true)
  const [error,       setError]              = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isStaff) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/enrollments", {
        headers: { "x-demo-role": "staff" },
      })
      if (!res.ok) throw new Error("Failed to load enrollments")
      const data: EnrollmentSummary[] = await res.json()
      const arr = Array.isArray(data) ? data : []
      setEnrollments(arr)
      setCounts({
        total:     arr.length,
        pending:   arr.filter(e => e.status === "pending").length,
        confirmed: arr.filter(e => e.status === "confirmed").length,
        rejected:  arr.filter(e => e.status === "rejected").length,
        regular:   arr.filter(e => e.student_type === "regular").length,
        irregular: arr.filter(e => e.student_type === "irregular").length,
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [isStaff])

  useEffect(() => { load() }, [load])

  if (!isStaff) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-4xl">🔒</p>
        <p className="text-pupila-ink font-semibold">Staff access required</p>
        <p className="text-sm text-pupila-mute">
          Use the role toggle in the header to switch to Admin View.
        </p>
        <Link href="/" className="inline-block mt-2 text-sm text-pupila-brand hover:underline">
          ← Back to student portal
        </Link>
      </div>
    )
  }

  // Sort pending by created_at ascending (oldest first)
  const pendingList = [...enrollments]
    .filter(e => e.status === "pending")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .slice(0, 3)

  return (
    <div>
      {/* Eyebrow */}
      <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-pupila-mute mb-1.5">
        1ST SEMESTER&nbsp;&nbsp;|&nbsp;&nbsp;AY 2025–2026
      </p>

      {/* Heading */}
      <h1 className="text-[clamp(24px,2.5vw,30px)] font-semibold tracking-[-0.025em] leading-[1.15] text-pupila-ink mb-1.5">
        Enrollment overview
      </h1>
      <p className="text-sm text-pupila-mute mb-6">
        See where enrollment stands and what needs your attention today.
      </p>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px] mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-pupila-card border border-pupila-line rounded-[20px] px-6 py-[22px] h-[120px] animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-pupila-card border border-pupila-line rounded-[20px] px-6 py-8 text-center mb-4">
          <p className="text-pupila-brand text-sm mb-3">{error}</p>
          <button onClick={load} className="text-sm text-pupila-brand border border-pupila-line rounded-[10px] px-4 py-2 hover:bg-pupila-soft transition-colors">
            Retry
          </button>
        </div>
      ) : counts ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[14px] mb-4">
          <StatCard label="Total enrolled"   value={counts.total}     sub="All enrollments" />
          <StatCard label="Pending approval" value={counts.pending}   sub="Irregular requests" highlight />
          <StatCard label="Regular"          value={counts.regular}   sub={counts.total ? `${Math.round(counts.regular / counts.total * 100)}% of total` : undefined} />
          <StatCard label="Irregular"        value={counts.irregular} sub={counts.total ? `${Math.round(counts.irregular / counts.total * 100)}% of total` : undefined} />
        </div>
      ) : null}

      {/* Two-column: Needs review + placeholder */}
      {!loading && !error && counts !== null && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Needs review */}
          <div className="bg-pupila-card border border-pupila-line rounded-[20px] p-6">
            <div className="flex items-end justify-between gap-4 flex-wrap mb-2.5">
              <div>
                <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-pupila-ink">Needs review</h2>
                <p className="text-sm text-pupila-mute mt-0.5">Oldest requests first.</p>
              </div>
              <Link
                href="/admin/requests"
                className="text-sm font-medium border border-pupila-line bg-pupila-card rounded-[10px] px-[14px] py-2 hover:bg-pupila-soft transition-colors text-pupila-ink"
              >
                View all
              </Link>
            </div>

            {pendingList.length === 0 ? (
              <p className="text-sm text-pupila-mute pt-3.5">All requests are reviewed.</p>
            ) : (
              pendingList.map(e => (
                <div key={e.enr_number} className="grid grid-cols-[1fr_auto] gap-3.5 items-center py-3.5 border-t border-pupila-line">
                  <div>
                    <p className="font-semibold text-[15px] text-pupila-ink">{e.full_name}</p>
                    <p className="text-[13px] text-pupila-mute font-mono">{e.student_id}</p>
                  </div>
                  <Link
                    href="/admin/requests"
                    className="text-sm font-medium border border-pupila-line bg-pupila-card rounded-[10px] px-[14px] py-2 hover:bg-pupila-soft transition-colors text-pupila-ink whitespace-nowrap"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>

          {/* Enrollment summary */}
          <div className="bg-pupila-card border border-pupila-line rounded-[20px] p-6 flex flex-col gap-2">
            <div className="mb-1">
              <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-pupila-ink">Enrollment summary</h2>
              <p className="text-sm text-pupila-mute mt-0.5">{counts.total} total enrollment{counts.total !== 1 ? "s" : ""} this semester.</p>
            </div>
            {[
              { label: "Confirmed",  value: counts.confirmed, color: "bg-pupila-green" },
              { label: "Pending",    value: counts.pending,   color: "bg-pupila-gold" },
              { label: "Rejected",   value: counts.rejected,  color: "bg-pupila-brand" },
            ].map(row => (
              <div key={row.label} className="flex items-center gap-3 py-2 border-t border-pupila-line">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${row.color}`} />
                <span className="text-sm text-pupila-ink flex-1">{row.label}</span>
                <span className="text-sm font-semibold text-pupila-ink tabular-nums">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
