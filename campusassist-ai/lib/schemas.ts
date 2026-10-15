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

// ── Auth ──────────────────────────────────────────────────────────────
export const SignUpSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name:  z.string().min(1, "Last name is required"),
  email:      z.string().email("Invalid email address"),
  student_id: z.string().regex(
    /^\d{4}-\d{5}-MN-[01]$/,
    "Student ID must be in the format YYYY-NNNNN-MN-0 or YYYY-NNNNN-MN-1"
  ),
  password:   z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one symbol"),
})

export const SignInSchema = z.object({
  email:    z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// ── Inferred types ────────────────────────────────────────────────────
export type ChatRequest        = z.infer<typeof ChatRequestSchema>
export type AIResponse         = z.infer<typeof AIResponseSchema>
export type EnrollmentRequest  = z.infer<typeof EnrollmentSchema>
export type UpdateEnrollment   = z.infer<typeof UpdateEnrollmentSchema>
export type SignUpRequest       = z.infer<typeof SignUpSchema>
export type SignInRequest       = z.infer<typeof SignInSchema>
