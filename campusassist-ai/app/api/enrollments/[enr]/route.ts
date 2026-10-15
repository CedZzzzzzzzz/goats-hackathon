import { NextRequest, NextResponse } from "next/server"
import { UpdateEnrollmentSchema } from "@/lib/schemas"
import { supabase } from "@/lib/supabase"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

// GET /api/enrollments/[enr]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ enr: string }> }
) {
  const { enr } = await params

  const { data: enrollment, error } = await db
    .from("enrollments")
    .select("id, enr_number, full_name, student_id, student_type, year_level, program, semester, academic_year, status, created_at, updated_at")
    .eq("enr_number", enr)
    .single() as { data: { id: number; enr_number: string; full_name: string; student_id: string; student_type: string; year_level: string; program: string; semester: string; academic_year: string; status: string; created_at: string; updated_at: string } | null; error: unknown }

  if (error || !enrollment) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
  }

  // Fetch enrolled subjects
  const { data: es } = await db
    .from("enrollment_subjects")
    .select("subject_code")
    .eq("enrollment_id", enrollment.id)

  const codes = ((es ?? []) as { subject_code: string }[]).map(r => r.subject_code)

  const { data: subjects } = codes.length > 0
    ? await db.from("subjects").select("code, name, units, year_level, program").in("code", codes)
    : { data: [] }

  const { id: _id, ...rest } = enrollment
  void _id
  return NextResponse.json({ ...rest, subjects: subjects ?? [] })
}

// PATCH /api/enrollments/[enr]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ enr: string }> }
) {
  const role = req.headers.get("x-demo-role")
  if (role !== "staff") {
    return NextResponse.json({ error: "Staff access required" }, { status: 403 })
  }

  const { enr } = await params

  let body: unknown
  try { body = await req.json() } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = UpdateEnrollmentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
  }

  const { data: existing, error: findErr } = await db
    .from("enrollments")
    .select("enr_number")
    .eq("enr_number", enr)
    .single()

  if (findErr || !existing) {
    return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
  }

  const { data: updated, error: updateErr } = await db
    .from("enrollments")
    .update({ status: parsed.data.status })
    .eq("enr_number", enr)
    .select("enr_number, status, updated_at")
    .single()

  if (updateErr || !updated) {
    return NextResponse.json({ error: "Failed to update enrollment" }, { status: 500 })
  }

  return NextResponse.json(updated)
}
