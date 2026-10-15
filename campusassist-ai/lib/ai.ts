import type { AIResponse } from "@/types"
import kb from "@/lib/kb.json"

interface KBEntry {
  id:       string
  title:    string
  type:     "info" | "checklist" | "unknown"
  keywords: string[]
  content:  string
  items?:   string[]
}

const entries = kb as KBEntry[]

const FALLBACK: AIResponse = {
  answer: "I don't have information about that. Please contact the Registrar's Office directly.",
  source: null,
  type:   "unknown",
  items:  null
}

export function getAIResponse(message: string): AIResponse {
  if (!message || message.trim().length === 0) return FALLBACK

  const lower = message.toLowerCase()
  const words = lower.split(/\s+/).map(w => w.replace(/[^a-z0-9]/g, ""))

  // Score each entry by how many of its keywords appear in the message
  let bestEntry: KBEntry | null = null
  let bestScore = 0

  for (const entry of entries) {
    const score = entry.keywords.filter(kw => words.some(w => w === kw)).length
    if (score > bestScore) {
      bestScore = score
      bestEntry = entry
    }
  }

  if (!bestEntry || bestScore === 0) return FALLBACK

  return {
    answer: bestEntry.content,
    source: bestEntry.title,
    type:   bestEntry.type,
    items:  bestEntry.items ?? null
  }
}
