import { NextRequest, NextResponse } from "next/server"
import { EnrollmentSchema } from "@/lib/schemas"
import { supabase } from "@/lib/supabase"
import { generateEnrNumber } from "@/lib/utils"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

// POST /api/enrollments
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = EnrollmentSchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Invalid request body"
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { full_name, student_id, student_type, year_level, program, subject_codes } = parsed.data
    const status = student_type === "regular" ? "confirmed" : "pending"

    // 1. Insert enrollment row (enr_number is a placeholder — updated right after)
    const { data: enrollment, error: insertErr } = await db
      .from("enrollments")
      .insert({
        enr_number:    "PENDING",
        full_name,
        student_id,
        student_type,
        year_level,
        program,
        semester:      "1st Semester",
        academic_year: "2025-2026",
        status,
      })
      .select("id")
      .single()

    if (insertErr || !enrollment) {
      return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
    }

    // 2. Generate ENR number and update row
    const enr_number = generateEnrNumber(enrollment.id)
    await db.from("enrollments").update({ enr_number }).eq("id", enrollment.id)

    // 3. Resolve subject codes
    let resolvedCodes: string[] = []

    if (student_type === "regular") {
      const { data: curriculum } = await db
        .from("curricula")
        .select("subject_code")
        .eq("year_level", year_level)
        .eq("program", program)
      resolvedCodes = (curriculum ?? []).map((c: { subject_code: string }) => c.subject_code)
    } else {
      resolvedCodes = subject_codes ?? []
    }

    // 4. Insert enrollment_subjects rows
    if (resolvedCodes.length > 0) {
      const rows = resolvedCodes.map((code: string) => ({
        enrollment_id: enrollment.id,
        subject_code:  code,
      }))
      await db.from("enrollment_subjects").insert(rows)
    }

    // 5. Fetch subject details for the response
    const { data: subjects } = await db
      .from("subjects")
      .select("code, name, units")
      .in("code", resolvedCodes)

    return NextResponse.json({ enr_number, status, subjects: subjects ?? [] }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Failed to create enrollment" }, { status: 500 })
  }
}

// GET /api/enrollments  (staff only)
export async function GET(req: NextRequest) {
  const role = req.headers.get("x-demo-role")
  if (role !== "staff") {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 })
  }

  const { data, error } = await db
    .from("enrollments")
    .select("enr_number, full_name, student_id, student_type, year_level, program, status, created_at")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }

  const enriched = await Promise.all(
    (data ?? []).map(async (enrollment: Record<string, unknown>) => {
      const { data: enrRow } = await db
        .from("enrollments")
        .select("id")
        .eq("enr_number", enrollment.enr_number)
        .single()

      if (!enrRow) return { ...enrollment, subjects: [] }

      const { data: es } = await db
        .from("enrollment_subjects")
        .select("subject_code")
        .eq("enrollment_id", enrRow.id)

      const codes = (es ?? []).map((r: { subject_code: string }) => r.subject_code)
      const { data: subs } = await db
        .from("subjects")
        .select("code, name, units, year_level, program")
        .in("code", codes)

      return { ...enrollment, subjects: subs ?? [] }
    })
  )

  return NextResponse.json(enriched)
}
