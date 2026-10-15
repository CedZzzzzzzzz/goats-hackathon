import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const { data, error } = await supabase
    .from("subjects")
    .select("code, name, units, year_level, program")
    .order("year_level")
    .order("code")

  if (error) {
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 })
  }

  return NextResponse.json(data)
}
