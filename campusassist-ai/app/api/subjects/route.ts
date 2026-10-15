import { supabase } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabase
    .from("subjects")
    .select("code, name, units, year_level, program")
    .order("code")

  if (error) {
    return Response.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }

  return Response.json(data, { status: 200 })
}
