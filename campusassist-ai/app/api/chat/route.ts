import { NextRequest, NextResponse } from "next/server"
import { ChatRequestSchema } from "@/lib/schemas"
import { getAIResponse } from "@/lib/ai"

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = ChatRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }
    const response = getAIResponse(parsed.data.message)
    return NextResponse.json(response)
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}
