import { z } from "zod"

// ── Chat ─────────────────────────────────────────────────────────────
export const ChatRequestSchema = z.object({
  message: z.string().min(1).max(500)
})

export const AIResponseSchema = z.object({
  answer: z.string(),
  source: z.string().nullable(),
  type:   z.enum(["info", "checklist", "unknown"]),
  items:  z.array(z.string()).nullable()
})

// ── Enrollment submission ─────────────────────────────────────────────
export const EnrollmentSchema = z.object({
  full_name:     z.string().min(2).max(100),
  // Format: YYYY-NNNNN (4-digit year, hyphen, exactly 5 digits) — e.g. 2024-01092
  student_id:    z.string().regex(
    /^\d{4}-\d{5}$/,
    "Student ID must be in the format YYYY-NNNNN (e.g. 2024-01092)"
  ),
  student_type:  z.enum(["regular", "irregular"]),
  year_level:    z.enum(["1st Year", "2nd Year", "3rd Year", "4th Year"]),
  program:       z.string().min(2).max(50),
  subject_codes: z.array(z.string()).optional()
}).refine(
  data => data.student_type !== "irregular" || (data.subject_codes && data.subject_codes.length > 0),
  { message: "Irregular students must select at least one subject", path: ["subject_codes"] }
)

// ── Admin status update ───────────────────────────────────────────────
export const UpdateEnrollmentSchema = z.object({
  status: z.enum(["confirmed", "rejected"])
})

// ── Inferred types ────────────────────────────────────────────────────
export type ChatRequest        = z.infer<typeof ChatRequestSchema>
export type AIResponse         = z.infer<typeof AIResponseSchema>
export type EnrollmentRequest  = z.infer<typeof EnrollmentSchema>
export type UpdateEnrollment   = z.infer<typeof UpdateEnrollmentSchema>
