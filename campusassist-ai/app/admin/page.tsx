"use client"

import { useEffect, useState, useCallback } from "react"
import type { Enrollment } from "@/types"
import { AdminTable } from "@/components/AdminTable"
import { useRole } from "@/components/RoleToggle"

export default function AdminPage() {
  const { isStaff }  = useRole()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!isStaff) { setLoading(false); return }
    setLoading(true)
    try {
      const res = await fetch("/api/enrollments", {
        headers: { "x-demo-role": "staff" },
      })
      if (!res.ok) throw new Error("Failed to load enrollments")
      const data = await res.json()
      setEnrollments(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [isStaff])

  useEffect(() => { load() }, [load])

  if (!isStaff) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-4xl">🔒</p>
        <p className="text-gray-600 font-semibold">Staff access required</p>
        <p className="text-sm text-gray-400">
          Switch to Staff View using the toggle in the header.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Review and action enrollment submissions.</p>
        </div>
        <button
          onClick={load}
          className="text-sm text-indigo-600 hover:underline"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading enrollments…</div>
      ) : error ? (
        <div className="text-center py-16 text-red-500">{error}</div>
      ) : (
        <AdminTable enrollments={enrollments} onStatusChange={load} />
      )}
    </div>
  )
}
