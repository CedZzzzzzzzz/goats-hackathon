"use client"

import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import type { AIResponse } from "@/types"
import { ChecklistCard } from "./ChecklistCard"

interface Message {
  role:    "user" | "assistant"
  content: string
  ai?:     AIResponse
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role:    "assistant",
      content: "Hi! I'm CampusAssist AI. Ask me anything about enrollment.",
      ai:      { answer: "Hi! I'm CampusAssist AI. Ask me anything about enrollment.", source: null, type: "info", items: null },
    },
  ])
  const [input,   setInput]   = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: text }])
    setLoading(true)
    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: text }),
      })
      const data: AIResponse = await res.json()
      setMessages(prev => [...prev, { role: "assistant", content: data.answer, ai: data }])
    } catch {
      setMessages(prev => [...prev, {
        role:    "assistant",
        content: "Something went wrong. Please try again.",
        ai:      { answer: "Something went wrong.", source: null, type: "unknown", items: null },
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] ${msg.role === "user" ? "order-1" : ""}`}>
              {msg.role === "user" ? (
                <div className="bg-indigo-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm">
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-gray-800">
                    {msg.content}
                    {msg.ai?.source && msg.ai.type !== "checklist" && (
                      <p className="text-xs text-gray-400 mt-1">Source: {msg.ai.source}</p>
                    )}
                  </div>
                  {msg.ai?.type === "checklist" && msg.ai.items && (
                    <ChecklistCard items={msg.ai.items} source={msg.ai.source} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-gray-400">
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white p-3 flex gap-2">
        <input
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="Ask about enrollment…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
