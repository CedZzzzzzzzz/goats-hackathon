import type { AIResponse } from "@/types"
import kb from "./kb.json"

interface KBEntry {
  id:       string
  keywords: string[]
  answer:   string
  source:   string
  type:     "info" | "checklist" | "unknown"
  items:    string[] | null
}

const entries = kb as KBEntry[]

export function getAIResponse(message: string): AIResponse {
  const normalised = message.toLowerCase().trim()

  for (const entry of entries) {
    const matched = entry.keywords.some(kw => normalised.includes(kw.toLowerCase()))
    if (matched) {
      return {
        answer: entry.answer,
        source: entry.source,
        type:   entry.type,
        items:  entry.items,
      }
    }
  }

  return {
    answer: "I don't have information about that. Please contact the Registrar's Office directly.",
    source: null,
    type:   "unknown",
    items:  null,
  }
}
