"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { Subject } from "@/types"
import { SubjectPicker } from "@/components/SubjectPicker"
import { PROGRAMS, type Program } from "@/lib/schemas"

type StudentType = "regular" | "irregular"
type YearLevel   = "1st Year" | "2nd Year" | "3rd Year" | "4th Year"

interface FormState {
  full_name:    string
  student_id:   string
  student_type: StudentType
  year_level:   YearLevel
  program:      Program
}

const YEAR_LEVELS: YearLevel[] = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

// Wrap in Suspense so useSearchParams() is safe during SSR/static export
export default function EnrollPage() {
  return (
    <Suspense>
      <EnrollPageInner />
    </Suspense>
  )
}

function EnrollPageInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const typeParam    = searchParams.get("type")
  const initialType: StudentType = typeParam === "irregular" ? "irregular" : "regular"

  const [form, setForm] = useState<FormState>({
    full_name:    "",
    student_id:   "",
    student_type: initialType,
    year_level:   "1st Year",
    program:      "DCPET",
  })
  const [subjectCodes,    setSubjectCodes]    = useState<string[]>([])
  const [subjects,        setSubjects]        = useState<Subject[]>([])
  const [errors,          setErrors]          = useState<Record<string, string>>({})
  const [loading,         setLoading]         = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)
  const [subjectsError,   setSubjectsError]   = useState<string | null>(null)

  useEffect(() => {
    if (form.student_type !== "irregular") return
    setSubjectsLoading(true)
    setSubjectsError(null)
    fetch("/api/subjects")
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => setSubjects(Array.isArray(data) ? data : []))
      .catch(() => setSubjectsError("Could not load subjects. Please refresh and try again."))
      .finally(() => setSubjectsLoading(false))
  }, [form.student_type])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.full_name.trim())  e.full_name  = "Full name is required"
    if (!form.student_id.trim()) e.student_id = "Student ID is required"
    if (form.student_type === "irregular" && subjectCodes.length === 0)
      e.subject_codes = "Select at least one subject"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const body: Record<string, unknown> = { ...form }
      if (form.student_type === "irregular") body.subject_codes = subjectCodes
      const res  = await fetch("/api/enrollments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setErrors({ form: data.error ?? "Enrollment failed." }); return }
      router.push(`/success?enr=${encodeURIComponent(data.enr_number)}&status=${data.status}`)
    } catch {
      setErrors({ form: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  // Shared input class builders
  const inputBase   = "w-full border rounded-xl px-4 py-3 text-[14px] outline-none transition-all placeholder:text-gray-400 text-gray-900"
  const inputOk     = `${inputBase} border-gray-200 bg-white focus:border-[#9B1B1B]/50 focus:ring-2 focus:ring-[#9B1B1B]/[0.08]`
  const inputErr    = `${inputBase} border-red-400 bg-red-50/60 focus:border-red-400 focus:ring-2 focus:ring-red-100`

  return (
    <div className="min-h-full py-8 px-6 flex flex-col items-center bg-[#F4F5F9]">

      {/* Back link */}
      <div className="w-full max-w-[520px] mb-3">
        <a href="/" className="inline-flex items-center gap-1.5 text-[13px] text-gray-400 hover:text-[#9B1B1B] transition-colors">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Back to home
        </a>
      </div>

      {/* ── Form card ── */}
      <div className="w-full max-w-[520px] bg-white rounded-2xl border border-gray-200/80 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">

        {/* Card header strip */}
        <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-[#9B1B1B]/[0.08] flex items-center justify-center shrink-0">
            <svg className="w-[18px] h-[18px] text-[#9B1B1B]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] font-bold text-gray-900 leading-tight">Enrollment Form</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{form.program} · AY 2025–2026 · 1st Semester</p>
          </div>
          {/* Student type badge */}
          <span
            className="shrink-0 text-[11px] font-bold uppercase tracking-wide px-3 py-1 rounded-full"
            style={
              form.student_type === "regular"
                ? { backgroundColor: "#E6F8EE", color: "#12805C" }
                : { backgroundColor: "#FFF6DB", color: "#8A6100" }
            }
          >
            {form.student_type === "regular" ? "Regular" : "Irregular"}
          </span>
        </div>

        {/* Form body */}
        <form onSubmit={submit} className="px-7 py-6 space-y-5">

          {/* Full name */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Full Name</label>
            <input
              className={errors.full_name ? inputErr : inputOk}
              placeholder="e.g. Sam Torres"
              value={form.full_name}
              onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            />
            {errors.full_name && (
              <p className="flex items-center gap-1 text-[12px] text-red-500">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {errors.full_name}
              </p>
            )}
          </div>

          {/* Student ID */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Student ID</label>
            <input
              className={errors.student_id ? inputErr : inputOk}
              placeholder="e.g. 2024-10099"
              value={form.student_id}
              onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
            />
            {errors.student_id && (
              <p className="flex items-center gap-1 text-[12px] text-red-500">
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                {errors.student_id}
              </p>
            )}
          </div>

          {/* Year level + Program */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Year Level</label>
              <select
                className={inputOk}
                value={form.year_level}
                onChange={e => setForm(f => ({ ...f, year_level: e.target.value as YearLevel }))}
              >
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Program</label>
              <select
                className={inputOk}
                value={form.program}
                onChange={e => setForm(f => ({ ...f, program: e.target.value as Program }))}
              >
                {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Subject picker — irregular only */}
          {form.student_type === "irregular" && (
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Select Subjects</label>
              {subjectsLoading ? (
                <div className="flex items-center justify-center gap-2 py-7 text-[13px] text-gray-400">
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                  </svg>
                  Loading subjects…
                </div>
              ) : subjectsError ? (
                <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{subjectsError}</p>
              ) : (
                <SubjectPicker subjects={subjects} selected={subjectCodes} onChange={setSubjectCodes} error={errors.subject_codes} />
              )}
            </div>
          )}

          {/* Form-level error */}
          {errors.form && (
            <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600">
              <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
              <p className="text-[13px]">{errors.form}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#9B1B1B] hover:bg-[#7c1515] text-white font-semibold text-[14px] py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm mt-1"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Submitting…
              </>
            ) : (
              <>
                Submit Enrollment
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  )
}
