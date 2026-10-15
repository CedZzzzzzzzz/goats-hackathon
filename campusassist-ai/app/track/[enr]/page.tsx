"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import type { Enrollment } from "@/types"
import { StatusTimeline } from "@/components/StatusTimeline"

export default function TrackPage() {
  const params     = useParams()
  const enrNumber  = decodeURIComponent(params.enr as string)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/enrollments/${encodeURIComponent(enrNumber)}`)
      .then(r => {
        if (!r.ok) throw new Error("Enrollment not found")
        return r.json()
      })
      .then(data => setEnrollment(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [enrNumber])

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Loading enrollment…</div>
  }

  if (error || !enrollment) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-gray-500">{error ?? "Enrollment not found."}</p>
        <Link href="/enroll" className="text-indigo-600 underline text-sm">Start a new enrollment</Link>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enrollment Status</h1>
        <p className="text-sm text-gray-500 mt-1">
          Tracking: <span className="font-mono text-indigo-600">{enrollment.enr_number}</span>
        </p>
      </div>

      {/* Status timeline */}
      <div className="border border-gray-200 rounded-xl p-6">
        <StatusTimeline status={enrollment.status} studentType={enrollment.student_type} />
      </div>

      {/* Student info */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Student Info</p>
        </div>
        <dl className="divide-y divide-gray-100">
          {[
            ["Name",         enrollment.full_name],
            ["Student ID",   enrollment.student_id],
            ["Student Type", enrollment.student_type],
            ["Year Level",   enrollment.year_level],
            ["Program",      enrollment.program],
            ["Semester",     enrollment.semester],
            ["Academic Year",enrollment.academic_year],
          ].map(([label, value]) => (
            <div key={label} className="px-4 py-2.5 flex gap-4 text-sm">
              <dt className="w-32 text-gray-500 shrink-0">{label}</dt>
              <dd className="text-gray-800 capitalize">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Subjects */}
      {enrollment.subjects && enrollment.subjects.length > 0 && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Enrolled Subjects</p>
          </div>
          <ul className="divide-y divide-gray-100">
            {enrollment.subjects.map(s => (
              <li key={s.code} className="px-4 py-3 flex items-center gap-3 text-sm">
                <span className="font-mono text-indigo-500 w-16 shrink-0">{s.code}</span>
                <span className="flex-1 text-gray-800">{s.name}</span>
                <span className="text-gray-400 text-xs">{s.units} units</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => window.location.reload()}
          className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
        <Link
          href="/enroll"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors"
        >
          New Enrollment
        </Link>
      </div>
    </div>
  )
}
