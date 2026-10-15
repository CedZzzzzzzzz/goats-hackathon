import { NextRequest } from "next/server"
import { ChatRequestSchema } from "@/lib/schemas"
import { getAIResponse } from "@/lib/ai"

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = ChatRequestSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body" }, { status: 400 })
  }

  const response = getAIResponse(parsed.data.message)
  return Response.json(response, { status: 200 })
}
