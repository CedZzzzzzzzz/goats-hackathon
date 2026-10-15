import { supabase, supabaseReady } from "@/lib/supabase"

// ── Demo subject pool (used when Supabase is not configured) ──────────
const DEMO_POOL = [
  { code: "GEN101",  name: "General Education 1",          units: 3, year_level: "1st Year", program: "DCPET" },
  { code: "GEN102",  name: "General Education 2",          units: 3, year_level: "1st Year", program: "DCPET" },
  { code: "CORE101", name: "Core Subject 1",               units: 3, year_level: "1st Year", program: "DCPET" },
  { code: "CORE201", name: "Core Subject 2",               units: 3, year_level: "2nd Year", program: "DCPET" },
  { code: "CORE202", name: "Core Subject 3",               units: 3, year_level: "2nd Year", program: "DCPET" },
  { code: "ELEC201", name: "Elective 1",                   units: 3, year_level: "2nd Year", program: "DCPET" },
  { code: "CORE301", name: "Core Subject 4",               units: 3, year_level: "3rd Year", program: "DCPET" },
  { code: "CORE302", name: "Core Subject 5",               units: 3, year_level: "3rd Year", program: "DCPET" },
  { code: "ELEC301", name: "Elective 2",                   units: 3, year_level: "3rd Year", program: "DCPET" },
  { code: "CAPS401", name: "Capstone Project 1",           units: 3, year_level: "4th Year", program: "DCPET" },
  { code: "CAPS402", name: "Capstone Project 2",           units: 3, year_level: "4th Year", program: "DCPET" },
  { code: "ELEC401", name: "Elective 3",                   units: 3, year_level: "4th Year", program: "DCPET" },
]

export async function GET() {
  if (!supabaseReady) {
    return Response.json(DEMO_POOL, { status: 200 })
  }

  const { data, error } = await supabase
    .from("subjects")
    .select("code, name, units, year_level, program")
    .order("code")

  if (error) {
    return Response.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }

  return Response.json(data, { status: 200 })
}
