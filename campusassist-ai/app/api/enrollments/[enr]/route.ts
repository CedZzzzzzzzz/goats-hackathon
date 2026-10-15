import { NextRequest } from "next/server"
import { UpdateEnrollmentSchema } from "@/lib/schemas"
import { supabase } from "@/lib/supabase"

interface RouteParams {
  params: Promise<{ enr: string }>
}

// ── GET /api/enrollments/[enr] — enrollment detail ────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { enr } = await params

  // Fetch enrollment row
  const { data: enrollment, error } = await supabase
    .from("enrollments")
    .select("id, enr_number, full_name, student_id, student_type, year_level, program, semester, academic_year, status, created_at, updated_at")
    .eq("enr_number", enr)
    .single()

  if (error || !enrollment) {
    return Response.json({ error: "Enrollment not found" }, { status: 404 })
  }

  // Fetch subjects for this enrollment
  const { data: subjects, error: subjError } = await supabase
    .from("enrollment_subjects")
    .select("subject_code, subject_name, units")
    .eq("enrollment_id", enrollment.id)

  if (subjError) {
    return Response.json({ error: "Failed to fetch enrollment subjects" }, { status: 500 })
  }

  const mappedSubjects = ((subjects ?? []) as { subject_code: string; subject_name: string; units: number }[]).map(s => ({
    code:  s.subject_code,
    name:  s.subject_name,
    units: s.units
  }))

  return Response.json(
    {
      enr_number:    enrollment.enr_number,
      full_name:     enrollment.full_name,
      student_id:    enrollment.student_id,
      student_type:  enrollment.student_type,
      year_level:    enrollment.year_level,
      program:       enrollment.program,
      semester:      enrollment.semester,
      academic_year: enrollment.academic_year,
      status:        enrollment.status,
      subjects:      mappedSubjects,
      created_at:    enrollment.created_at,
      updated_at:    enrollment.updated_at
    },
    { status: 200 }
  )
}

// ── PATCH /api/enrollments/[enr] — admin confirm / reject ─────────────

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { enr } = await params

  if (req.headers.get("x-demo-role") !== "staff") {
    return Response.json({ error: "Staff access required" }, { status: 403 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = UpdateEnrollmentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Invalid status value" }, { status: 400 })
  }

  const { data: updated, error } = await supabase
    .from("enrollments")
    .update({ status: parsed.data.status })
    .eq("enr_number", enr)
    .select("enr_number, status, updated_at")
    .single()

  if (error || !updated) {
    return Response.json({ error: "Enrollment not found" }, { status: 404 })
  }

  return Response.json(updated, { status: 200 })
}
