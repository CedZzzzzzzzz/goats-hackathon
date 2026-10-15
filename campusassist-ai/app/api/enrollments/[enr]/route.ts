import { NextRequest } from "next/server"
import { UpdateEnrollmentSchema } from "@/lib/schemas"
import {
  supabaseAdmin,
  supabaseReady,
  verifyToken,
  isAdminUser,
  createUserClient,
} from "@/lib/supabase"

interface RouteParams {
  params: Promise<{ enr: string }>
}

// ── GET /api/enrollments/[enr] — student reads their own enrollment ────
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { enr } = await params

  if (!supabaseReady) {
    const { getMemEnrollment } = await import("@/lib/mem-store")
    const record = getMemEnrollment(enr)
    if (!record) return Response.json({ error: "Enrollment not found" }, { status: 404 })
    return Response.json(record, { status: 200 })
  }

  // Verify the student's JWT so RLS can identify them
  const user = await verifyToken(req.headers.get("authorization"))
  if (!user) {
    return Response.json({ error: "Authentication required" }, { status: 401 })
  }

  // Use a per-request client that carries the student's JWT.
  // RLS policy: user_id = auth.uid() — only their own row is returned.
  const userClient = createUserClient(
    req.headers.get("authorization")!.replace(/^Bearer\s+/i, "").trim()
  )

  const { data: enrollment, error } = await userClient
    .from("enrollments")
    .select("id, enr_number, full_name, student_id, student_type, year_level, program, semester, academic_year, status, created_at, updated_at")
    .eq("enr_number", enr)
    .single()

  if (error || !enrollment) {
    return Response.json({ error: "Enrollment not found" }, { status: 404 })
  }

  // Fetch subjects via the user client (RLS on enrollment_subjects checks enrollment ownership)
  const { data: subjects, error: subjError } = await userClient
    .from("enrollment_subjects")
    .select("subject_code, subject_name, units")
    .eq("enrollment_id", enrollment.id)

  if (subjError) {
    return Response.json({ error: "Failed to fetch enrollment subjects" }, { status: 500 })
  }

  const mappedSubjects = (
    (subjects ?? []) as { subject_code: string; subject_name: string; units: number }[]
  ).map(s => ({
    code:  s.subject_code,
    name:  s.subject_name,
    units: s.units,
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
      updated_at:    enrollment.updated_at,
    },
    { status: 200 }
  )
}

// ── PATCH /api/enrollments/[enr] — admin confirm / reject ─────────────
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { enr } = await params

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

  if (!supabaseReady) {
    // In-memory fallback: accept x-demo-role header
    if (req.headers.get("x-demo-role") !== "staff") {
      return Response.json({ error: "Staff access required" }, { status: 403 })
    }
    const { patchMemEnrollment } = await import("@/lib/mem-store")
    const updated = patchMemEnrollment(enr, parsed.data.status)
    if (!updated) return Response.json({ error: "Enrollment not found" }, { status: 404 })
    return Response.json(updated, { status: 200 })
  }

  // With Supabase: require a verified admin JWT
  const admin = await isAdminUser(req.headers.get("authorization"))
  if (!admin) {
    return Response.json({ error: "Staff access required" }, { status: 403 })
  }

  // Admin client bypasses RLS — can update any row
  const { data: updated, error } = await supabaseAdmin
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
