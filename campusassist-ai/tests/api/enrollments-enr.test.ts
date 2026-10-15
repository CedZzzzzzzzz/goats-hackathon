import { describe, it, expect, vi, beforeEach } from "vitest"
import { NextRequest } from "next/server"

// ── Supabase mock ──────────────────────────────────────────────────────

const mockEnrollment = {
  id: 2, enr_number: "ENR-2025-0002", full_name: "Jordan Lee",
  student_id: "S10002", student_type: "irregular", year_level: "3rd Year",
  program: "BSIT", semester: "1st Semester", academic_year: "2025-2026",
  status: "pending", created_at: "2025-07-01T10:00:00Z", updated_at: "2025-07-01T10:00:00Z"
}

const mockSubjectRows = [
  { subject_code: "IT301", subject_name: "Web Systems and Technologies", units: 3 },
  { subject_code: "IT302", subject_name: "Networks and Communications",  units: 3 }
]

// call counter to distinguish GET (first enrollments call) from PATCH (second)
let enrollmentsCallCount = 0

vi.mock("@/lib/supabase", () => {
  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table === "enrollments") {
          enrollmentsCallCount++
          if (enrollmentsCallCount % 2 === 1) {
            // GET — fetch enrollment row by enr_number
            return {
              select: vi.fn().mockReturnThis(),
              eq:     vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({ data: mockEnrollment, error: null })
            }
          } else {
            // PATCH — update status
            return {
              update: vi.fn().mockReturnThis(),
              eq:     vi.fn().mockReturnThis(),
              select: vi.fn().mockReturnThis(),
              single: vi.fn().mockResolvedValue({
                data: { enr_number: "ENR-2025-0002", status: "confirmed", updated_at: "2025-07-01T15:00:00Z" },
                error: null
              })
            }
          }
        }
        if (table === "enrollment_subjects") {
          return {
            select: vi.fn().mockReturnThis(),
            eq:     vi.fn().mockResolvedValue({ data: mockSubjectRows, error: null })
          }
        }
        return {}
      })
    }
  }
})

const { GET, PATCH } = await import("@/app/api/enrollments/[enr]/route")

function makeGetRequest(enr: string) {
  return new NextRequest(`http://localhost/api/enrollments/${enr}`, { method: "GET" })
}

function makePatchRequest(enr: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost/api/enrollments/${enr}`, {
    method:  "PATCH",
    headers: { "Content-Type": "application/json", ...headers },
    body:    JSON.stringify(body)
  })
}

const params = (enr: string) => ({ params: Promise.resolve({ enr }) })

describe("GET /api/enrollments/[enr]", () => {
  beforeEach(() => { vi.clearAllMocks(); enrollmentsCallCount = 0 })

  it("returns 200 with full enrollment detail and subjects array", async () => {
    const res = await GET(makeGetRequest("ENR-2025-0002"), params("ENR-2025-0002"))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.enr_number).toBe("ENR-2025-0002")
    expect(json.status).toBe("pending")
    expect(Array.isArray(json.subjects)).toBe(true)
    expect(json.subjects[0]).toHaveProperty("code")
    expect(json.subjects[0]).toHaveProperty("name")
    expect(json.subjects[0]).toHaveProperty("units")
  })

  it("returns 404 when enrollment is not found", async () => {
    const { supabase } = await import("@/lib/supabase")
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } })
    } as any)
    const res = await GET(makeGetRequest("ENR-9999-9999"), params("ENR-9999-9999"))
    expect(res.status).toBe(404)
    const json = await res.json()
    expect(json.error).toBe("Enrollment not found")
  })
})

describe("PATCH /api/enrollments/[enr]", () => {
  beforeEach(() => { vi.clearAllMocks(); enrollmentsCallCount = 0 })

  it("returns 200 when staff confirms an enrollment", async () => {
    const { supabase } = await import("@/lib/supabase")
    vi.mocked(supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { enr_number: "ENR-2025-0002", status: "confirmed", updated_at: "2025-07-01T15:00:00Z" },
        error: null
      })
    } as any)
    const res = await PATCH(
      makePatchRequest("ENR-2025-0002", { status: "confirmed" }, { "x-demo-role": "staff" }),
      params("ENR-2025-0002")
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe("confirmed")
    expect(json.enr_number).toBe("ENR-2025-0002")
  })

  it("returns 200 when staff rejects an enrollment", async () => {
    const { supabase } = await import("@/lib/supabase")
    vi.mocked(supabase.from).mockReturnValueOnce({
      update: vi.fn().mockReturnThis(),
      eq:     vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { enr_number: "ENR-2025-0002", status: "rejected", updated_at: "2025-07-01T16:00:00Z" },
        error: null
      })
    } as any)
    const res = await PATCH(
      makePatchRequest("ENR-2025-0002", { status: "rejected" }, { "x-demo-role": "staff" }),
      params("ENR-2025-0002")
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe("rejected")
  })

  it("returns 403 without the staff header", async () => {
    const res = await PATCH(
      makePatchRequest("ENR-2025-0002", { status: "confirmed" }),
      params("ENR-2025-0002")
    )
    expect(res.status).toBe(403)
    const json = await res.json()
    expect(json.error).toBe("Staff access required")
  })

  it("returns 400 for an invalid status value", async () => {
    const res = await PATCH(
      makePatchRequest("ENR-2025-0002", { status: "maybe" }, { "x-demo-role": "staff" }),
      params("ENR-2025-0002")
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toBe("Invalid status value")
  })
})
