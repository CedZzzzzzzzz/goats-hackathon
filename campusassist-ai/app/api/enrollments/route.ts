import { NextRequest } from "next/server"
import { EnrollmentSchema } from "@/lib/schemas"
import { supabase } from "@/lib/supabase"
import { generateEnrNumber } from "@/lib/utils"
import { rateLimit, getClientIp } from "@/lib/rate-limit"

// ── GET /api/enrollments — admin list ─────────────────────────────────

const VALID_STATUSES = ["pending", "confirmed", "rejected"] as const

export async function GET(req: NextRequest) {
  if (req.headers.get("x-demo-role") !== "staff") {
    return Response.json({ error: "Staff access required" }, { status: 403 })
  }

  const statusParam = req.nextUrl.searchParams.get("status")
  const validStatus = VALID_STATUSES.includes(statusParam as typeof VALID_STATUSES[number])
    ? (statusParam as typeof VALID_STATUSES[number])
    : null

  let query = supabase
    .from("enrollments")
    .select("enr_number, full_name, student_id, student_type, year_level, program, status, created_at")

  if (validStatus) {
    query = query.eq("status", validStatus)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    return Response.json({ error: "Failed to fetch enrollments" }, { status: 500 })
  }

  return Response.json(data, { status: 200 })
}

// ── POST /api/enrollments — submit enrollment ─────────────────────────

export async function POST(req: NextRequest) {
  // Rate limit: 5 submissions per minute per IP
  const ip = getClientIp(req)
  const limit = rateLimit(ip, { limit: 5, windowMs: 60_000 })
  if (!limit.allowed) {
    return Response.json({ error: "Too many requests. Please wait a moment." }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = EnrollmentSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { full_name, student_id, student_type, year_level, program, subject_codes } = parsed.data

  // ── 1. Insert enrollment row with placeholder enr_number ────────────
  const { data: enrollment, error: insertError } = await supabase
    .from("enrollments")
    .insert({
      enr_number:    "pending",
      full_name,
      student_id,
      student_type,
      year_level,
      program,
      status: student_type === "regular" ? "confirmed" : "pending"
    })
    .select("id")
    .single()

  if (insertError || !enrollment) {
    return Response.json({ error: "Failed to create enrollment" }, { status: 500 })
  }

  // ── 2. Generate and set the real enr_number ──────────────────────────
  const enr_number = generateEnrNumber(enrollment.id)

  const { error: updateError } = await supabase
    .from("enrollments")
    .update({ enr_number })
    .eq("id", enrollment.id)

  if (updateError) {
    // Clean up dangling row
    await supabase.from("enrollments").delete().eq("id", enrollment.id)
    return Response.json({ error: "Failed to create enrollment" }, { status: 500 })
  }

  // ── 3. Resolve subjects ──────────────────────────────────────────────
  let resolvedSubjects: { code: string; name: string; units: number }[] = []

  if (student_type === "regular") {
    // Fetch prescribed curriculum for this year level + program
    const { data: curricula, error: currErr } = await supabase
      .from("curricula")
      .select("subject_code, subject_name, units")
      .eq("year_level", year_level)
      .eq("program", program)

    if (currErr || !curricula || curricula.length === 0) {
      await supabase.from("enrollments").delete().eq("id", enrollment.id)
      return Response.json({ error: "Failed to load curriculum for this year level" }, { status: 500 })
    }

    resolvedSubjects = curricula.map((c: { subject_code: string; subject_name: string; units: number }) => ({
      code:  c.subject_code,
      name:  c.subject_name,
      units: c.units
    }))
  } else {
    // Verify each subject_code exists in the subjects table
    const { data: subjects, error: subjErr } = await supabase
      .from("subjects")
      .select("code, name, units")
      .in("code", subject_codes!)

    if (subjErr) {
      await supabase.from("enrollments").delete().eq("id", enrollment.id)
      return Response.json({ error: "Failed to validate subjects" }, { status: 500 })
    }

    if (!subjects || subjects.length !== subject_codes!.length) {
      await supabase.from("enrollments").delete().eq("id", enrollment.id)
      return Response.json({ error: "One or more selected subjects are invalid" }, { status: 400 })
    }

    resolvedSubjects = (subjects as { code: string; name: string; units: number }[]).map(s => ({
      code:  s.code,
      name:  s.name,
      units: s.units
    }))
  }

  // ── 4. Insert enrollment_subjects rows ───────────────────────────────
  const subjectRows = resolvedSubjects.map(s => ({
    enrollment_id: enrollment.id,
    subject_code:  s.code,
    subject_name:  s.name,
    units:         s.units
  }))

  const { error: subjInsertError } = await supabase
    .from("enrollment_subjects")
    .insert(subjectRows)

  if (subjInsertError) {
    await supabase.from("enrollments").delete().eq("id", enrollment.id)
    return Response.json({ error: "Failed to create enrollment" }, { status: 500 })
  }

  // ── 5. Return response ───────────────────────────────────────────────
  return Response.json(
    {
      enr_number,
      status:   student_type === "regular" ? "confirmed" : "pending",
      subjects: resolvedSubjects
    },
    { status: 201 }
  )
}
