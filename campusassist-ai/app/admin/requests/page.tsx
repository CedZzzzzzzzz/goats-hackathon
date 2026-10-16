"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import type { Enrollment, EnrollmentSummary } from "@/types"
import { useRole } from "@/components/RoleToggle"
import { supabaseBrowser } from "@/lib/supabase-browser"

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabaseBrowser.auth.getSession()
  return {
    "x-demo-role": "staff",
    ...(session?.access_token ? { "Authorization": `Bearer ${session.access_token}` } : {}),
  }
}

// ── Status badge ──────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "confirmed" ? "bg-[#e7f5ee] text-pupila-green" :
    status === "rejected"  ? "bg-pupila-tint text-pupila-brand" :
                             "bg-pupila-soft text-pupila-mute"
  return (
    <span className={`text-xs font-medium rounded-full px-2.5 py-0.5 whitespace-nowrap ${cls}`}>
      {status === "confirmed" ? "Confirmed" : status === "rejected" ? "Rejected" : "Pending"}
    </span>
  )
}

// ── Detail panel ──────────────────────────────────────────────────────

interface DetailPanelProps {
  enrNumber:  string
  onRefresh:  () => void
}

type ActionState = "idle" | "confirming" | "rejecting" | "done-confirmed" | "done-rejected" | "error"

function DetailPanel({ enrNumber, onRefresh }: DetailPanelProps) {
  const [detail,  setDetail]  = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchErr, setFetchErr] = useState<string | null>(null)
  const [action,  setAction]  = useState<ActionState>("idle")
  const [actionErr, setActionErr] = useState<string | null>(null)

  useEffect(() => {
    setDetail(null)
    setLoading(true)
    setFetchErr(null)
    setAction("idle")
    setActionErr(null)
    authHeaders().then(headers =>
      fetch(`/api/enrollments/${encodeURIComponent(enrNumber)}`, { headers })
        .then(r => {
          if (!r.ok) throw new Error("Failed to load enrollment detail")
          return r.json()
        })
        .then((d: Enrollment) => { setDetail(d); setLoading(false) })
        .catch(e => { setFetchErr(e instanceof Error ? e.message : "Error"); setLoading(false) })
    )
  }, [enrNumber])

  async function handleAction(status: "confirmed" | "rejected") {
    if (action === "confirming" || action === "rejecting") return
    setActionErr(null)
    setAction(status === "confirmed" ? "confirming" : "rejecting")
    try {
      const res = await fetch(`/api/enrollments/${encodeURIComponent(enrNumber)}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", ...(await authHeaders()) },
        body:    JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? "Failed to update status")
      }
      setAction(status === "confirmed" ? "done-confirmed" : "done-rejected")
      // Update local detail to reflect new status
      setDetail(prev => prev ? { ...prev, status } : prev)
      onRefresh()
    } catch (e: unknown) {
      setActionErr(e instanceof Error ? e.message : "Unknown error")
      setAction("idle")
    }
  }

  if (loading) {
    return (
      <div className="bg-pupila-card border border-pupila-line rounded-[14px] p-6 space-y-3 animate-pulse">
        <div className="h-5 bg-pupila-soft rounded w-1/2" />
        <div className="h-4 bg-pupila-soft rounded w-1/3" />
        <div className="h-24 bg-pupila-soft rounded mt-4" />
      </div>
    )
  }

  if (fetchErr || !detail) {
    return (
      <div className="bg-pupila-card border border-pupila-line rounded-[14px] p-6 text-center">
        <p className="text-pupila-brand text-sm">{fetchErr ?? "Not found"}</p>
      </div>
    )
  }

  const isPendingIrregular = detail.status === "pending" && detail.student_type === "irregular"
  const isBusy = action === "confirming" || action === "rejecting"

  return (
    <div className="bg-pupila-card border border-pupila-line rounded-[14px] p-6">
      {/* Student header */}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.025em] text-pupila-ink">{detail.full_name}</h2>
          <p className="font-mono text-[13px] text-pupila-mute mt-0.5">
            {detail.student_id} · {detail.enr_number}
          </p>
        </div>
        <span className="text-xs font-medium bg-pupila-soft text-pupila-mute rounded-full px-2.5 py-1 shrink-0">
          {detail.program} · {detail.year_level}
        </span>
      </div>

      {/* Subjects list */}
      {detail.subjects && detail.subjects.length > 0 ? (
        <ul className="list-none m-0 p-0 text-sm mb-4">
          {detail.subjects.map(s => (
            <li key={s.code} className="flex gap-3 py-2 border-t border-pupila-line">
              <span className="font-mono text-pupila-mute w-14 shrink-0">{s.code}</span>
              <span className="text-pupila-ink flex-1">{s.name}</span>
              <span className="text-pupila-mute text-xs shrink-0">{s.units} units</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-pupila-mute mb-4 border-t border-pupila-line pt-3">No subjects on record.</p>
      )}

      {/* Current status indicator */}
      {!isPendingIrregular && (
        <div className="bg-pupila-soft rounded-[14px] px-4 py-3 mb-2">
          <p className="text-sm font-semibold text-pupila-ink">
            {detail.status === "confirmed" ? "Confirmed" : detail.status === "rejected" ? "Rejected" : "Pending"}
            {detail.student_type === "regular" && detail.status === "confirmed"
              ? " — regular students are auto-confirmed"
              : ""}
          </p>
        </div>
      )}

      {/* Inline success feedback */}
      {(action === "done-confirmed" || action === "done-rejected") && (
        <div
          className={[
            "rounded-[14px] px-4 py-3 mb-3 text-sm font-medium",
            action === "done-confirmed"
              ? "bg-[#e7f5ee] text-pupila-green"
              : "bg-pupila-tint text-pupila-brand",
          ].join(" ")}
          data-testid="action-success"
        >
          {action === "done-confirmed" ? "Enrollment confirmed." : "Enrollment rejected."}
        </div>
      )}

      {/* Inline error feedback */}
      {actionErr && (
        <p className="text-pupila-brand text-sm mb-3" data-testid="action-error">{actionErr}</p>
      )}

      {/* Action buttons — only for pending irregular */}
      {isPendingIrregular && action !== "done-confirmed" && action !== "done-rejected" && (
        <div className="flex gap-2 flex-wrap mt-4">
          <button
            onClick={() => handleAction("confirmed")}
            disabled={isBusy}
            data-testid="confirm-btn"
            className="text-sm font-medium border border-pupila-gold bg-pupila-gold hover:bg-[#e2a400] hover:border-[#e2a400] rounded-[10px] px-[14px] py-2 text-pupila-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action === "confirming" ? "Confirming…" : "Approve"}
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={isBusy}
            data-testid="reject-btn"
            className="text-sm font-medium border border-pupila-line bg-pupila-card hover:bg-pupila-soft rounded-[10px] px-[14px] py-2 text-pupila-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {action === "rejecting" ? "Rejecting…" : "Reject"}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Requests page ─────────────────────────────────────────────────────

export default function RequestsPage() {
  const { isStaff }                            = useRole()
  const [enrollments,   setEnrollments]        = useState<EnrollmentSummary[]>([])
  // initialLoad=true shows the full-page spinner; background=true silently refreshes the list
  const [initialLoad,   setInitialLoad]        = useState(true)
  const [backgrounding, setBackgrounding]      = useState(false)
  const [error,         setError]              = useState<string | null>(null)
  const [selected,      setSelected]           = useState<string | null>(null)

  const load = useCallback(async (background = false) => {
    if (!isStaff) { setInitialLoad(false); return }
    if (background) {
      setBackgrounding(true)
    } else {
      setInitialLoad(true)
    }
    setError(null)
    try {
      const res = await fetch("/api/enrollments", {
        headers: await authHeaders(),
      })
      if (!res.ok) throw new Error("Failed to load enrollments")
      const data = await res.json()
      const arr: EnrollmentSummary[] = Array.isArray(data) ? data : []
      setEnrollments(arr)
      // Auto-select first if nothing is selected or selection gone
      setSelected(prev => {
        if (prev && arr.some(e => e.enr_number === prev)) return prev
        return arr[0]?.enr_number ?? null
      })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setInitialLoad(false)
      setBackgrounding(false)
    }
  }, [isStaff])

  useEffect(() => { load(false) }, [load])

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

  return (
    <div>
      {/* Eyebrow */}
      <p className="font-mono text-[11px] font-medium tracking-[0.08em] text-pupila-brand mb-1.5 uppercase">
        Enrollment Requests
      </p>

      {/* Heading */}
      <h1 className="text-[clamp(24px,2.5vw,30px)] font-semibold tracking-[-0.025em] leading-[1.15] text-pupila-ink mb-1.5">
        Requests
      </h1>
      <p className="text-sm text-pupila-mute mb-6">
        Review each irregular request and approve or reject.
      </p>

      {initialLoad ? (
        <div className="text-center py-16 text-pupila-mute">Loading…</div>
      ) : error ? (
        <div className="bg-pupila-card border border-pupila-line rounded-[14px] px-6 py-8 text-center">
          <p className="text-pupila-brand text-sm mb-3">{error}</p>
          <button
            onClick={() => load(false)}
            className="text-sm text-pupila-brand border border-pupila-line rounded-[10px] px-4 py-2 hover:bg-pupila-soft transition-colors"
          >
            Retry
          </button>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="bg-pupila-card border border-pupila-line rounded-[14px] px-6 py-16 text-center">
          <p className="text-sm text-pupila-mute">No enrollments yet.</p>
        </div>
      ) : (
        /* Split layout: list left, detail right */
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] gap-4 items-start">

          {/* Left: enrollment list */}
          <div>
            {backgrounding && (
              <p className="text-xs text-pupila-mute mb-2 text-right">Refreshing…</p>
            )}
            {enrollments.map(e => (
              <button
                key={e.enr_number}
                onClick={() => setSelected(e.enr_number)}
                data-testid={`list-item-${e.enr_number}`}
                className={[
                  "block w-full text-left border rounded-[14px] px-4 py-[14px] mb-2.5 cursor-pointer transition-colors",
                  selected === e.enr_number
                    ? "border-pupila-brand bg-pupila-tint"
                    : "border-pupila-line bg-pupila-card hover:bg-pupila-soft",
                ].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[15px] text-pupila-ink truncate">{e.full_name}</span>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-[13px] text-pupila-mute mt-0.5">
                  {e.enr_number} · {e.student_type} · {e.year_level}
                </p>
              </button>
            ))}
          </div>

          {/* Right: detail panel */}
          <div className="lg:sticky lg:top-[80px]">
            {selected ? (
              <DetailPanel key={selected} enrNumber={selected} onRefresh={() => load(true)} />
            ) : (
              <div className="bg-pupila-card border border-pupila-line rounded-[14px] px-6 py-16 text-center">
                <p className="text-sm text-pupila-mute">Select a request to review.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
