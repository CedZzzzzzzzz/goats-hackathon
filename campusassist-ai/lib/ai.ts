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

  // Normalize: lowercase and collapse punctuation to spaces so phrases match
  const normalized = message.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim()

  // Score each entry by how many of its keywords appear as substrings in the normalized message
  let bestEntry: KBEntry | null = null
  let bestScore = 0

  for (const entry of entries) {
    const score = entry.keywords.filter(kw => normalized.includes(kw)).length
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
