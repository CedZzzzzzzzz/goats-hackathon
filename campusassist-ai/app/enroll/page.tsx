"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Subject } from "@/types"
import { SubjectPicker } from "@/components/SubjectPicker"

type StudentType = "regular" | "irregular"
type YearLevel   = "1st Year" | "2nd Year" | "3rd Year" | "4th Year"

interface FormState {
  full_name:    string
  student_id:   string
  student_type: StudentType
  year_level:   YearLevel
  program:      string
}

const YEAR_LEVELS: YearLevel[] = ["1st Year", "2nd Year", "3rd Year", "4th Year"]

export default function EnrollPage() {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    full_name:    "",
    student_id:   "",
    student_type: "regular",
    year_level:   "1st Year",
    program:      "BSIT",
  })
  const [subjectCodes, setSubjectCodes] = useState<string[]>([])
  const [subjects,     setSubjects]     = useState<Subject[]>([])
  const [errors,       setErrors]       = useState<Record<string, string>>({})
  const [loading,      setLoading]      = useState(false)
  const [subjectsLoading, setSubjectsLoading] = useState(false)

  // Load subjects when switching to irregular
  useEffect(() => {
    if (form.student_type !== "irregular") return
    setSubjectsLoading(true)
    fetch("/api/subjects")
      .then(r => r.json())
      .then(data => setSubjects(Array.isArray(data) ? data : []))
      .finally(() => setSubjectsLoading(false))
  }, [form.student_type])

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (!form.full_name.trim())   e.full_name  = "Full name is required"
    if (!form.student_id.trim())  e.student_id = "Student ID is required"
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
      if (!res.ok) {
        setErrors({ form: data.error ?? "Enrollment failed. Please try again." })
        return
      }
      router.push(`/success?enr=${encodeURIComponent(data.enr_number)}&status=${data.status}`)
    } catch {
      setErrors({ form: "Network error. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enrollment Form</h1>
        <p className="text-sm text-gray-500 mt-1">
          BSIT · AY 2025–2026 · 1st Semester
        </p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Full name */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${errors.full_name ? "border-red-400" : "border-gray-200"}`}
            placeholder="e.g. Sam Torres"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
          />
          {errors.full_name && <p className="text-red-500 text-xs">{errors.full_name}</p>}
        </div>

        {/* Student ID */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Student ID</label>
          <input
            className={`w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300 ${errors.student_id ? "border-red-400" : "border-gray-200"}`}
            placeholder="e.g. S10099"
            value={form.student_id}
            onChange={e => setForm(f => ({ ...f, student_id: e.target.value }))}
          />
          {errors.student_id && <p className="text-red-500 text-xs">{errors.student_id}</p>}
        </div>

        {/* Year level */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Year Level</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
            value={form.year_level}
            onChange={e => setForm(f => ({ ...f, year_level: e.target.value as YearLevel }))}
          >
            {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {/* Program */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Program</label>
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
            value="BSIT"
            readOnly
          />
        </div>

        {/* Student type */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Student Type</label>
          <div className="grid grid-cols-2 gap-3">
            {(["regular", "irregular"] as StudentType[]).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => { setForm(f => ({ ...f, student_type: type })); setSubjectCodes([]) }}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  form.student_type === type
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="font-semibold capitalize text-sm">{type}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {type === "regular"
                    ? "Auto-assigned subjects, confirmed instantly"
                    : "Pick your subjects, pending staff approval"}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Subject picker — irregular only */}
        {form.student_type === "irregular" && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Subjects</label>
            {subjectsLoading ? (
              <div className="text-sm text-gray-400 py-4 text-center">Loading subjects…</div>
            ) : (
              <SubjectPicker
                subjects={subjects}
                selected={subjectCodes}
                onChange={setSubjectCodes}
                error={errors.subject_codes}
              />
            )}
          </div>
        )}

        {errors.form && (
          <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Submitting…" : "Submit Enrollment"}
        </button>
      </form>
    </div>
  )
}
