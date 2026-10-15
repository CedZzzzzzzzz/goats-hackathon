export type StudentType      = "regular" | "irregular"
export type EnrollmentStatus = "pending" | "confirmed" | "rejected"

export interface Subject {
  code:       string
  name:       string
  units:      number
  year_level: string
  program:    string
}

export interface Enrollment {
  id:            number
  enr_number:    string
  full_name:     string
  student_id:    string
  student_type:  StudentType
  year_level:    string
  program:       string
  semester:      string
  academic_year: string
  status:        EnrollmentStatus
  subjects:      Subject[]
  created_at:    string
  updated_at:    string
}

export interface AIResponse {
  answer: string
  source: string | null
  type:   "info" | "checklist" | "unknown"
  items:  string[] | null
}
