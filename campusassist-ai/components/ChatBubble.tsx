"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, ChevronDown } from "lucide-react"

interface Message {
  role:    "user" | "assistant"
  content: string
}

const CHIPS = [
  "How do I enroll?",
  "Regular vs Irregular",
  "Required documents",
  "Track my status",
  "When is enrollment?",
]

export function ChatBubble() {
  const [open,       setOpen]       = useState(false)
  const [messages,   setMessages]   = useState<Message[]>([])
  const [input,      setInput]      = useState("")
  const [loading,    setLoading]    = useState(false)
  const [chipsShown, setChipsShown] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function sendText(text: string) {
    if (!text.trim() || loading) return
    setInput("")
    setChipsShown(false)

    const nextMessages: Message[] = [...messages, { role: "user", content: text.trim() }]
    setMessages(nextMessages)
    setLoading(true)

    let accumulated = ""

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()

      setMessages(prev => [...prev, { role: "assistant", content: "" }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const raw = decoder.decode(value, { stream: true })
        for (const line of raw.split("\n")) {
          if (!line.startsWith("data: ")) continue
          try {
            const event = JSON.parse(line.slice(6))
            if (event.type === "chunk" && event.text) {
              accumulated += event.text
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: "assistant", content: accumulated }
                return updated
              })
            }
          } catch { /* ignore malformed SSE lines */ }
        }
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* ── Floating modal ─────────────────────────────────────────────── */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{
            width:      "360px",
            height:     "520px",
            background: "#ffffff",
            border:     "1px solid #eadfd8",
            boxShadow:  "0 8px 40px rgba(155,27,27,0.15), 0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header — matches sidebar gradient */}
          <div
            className="flex items-center justify-between px-5 py-4 shrink-0"
            style={{ background: "linear-gradient(135deg, #9B1B1B 0%, #6E0A0E 100%)" }}
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.15)" }}
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </span>
              <span className="font-bold text-[14px] text-white tracking-wide">
                CampusAssist AI
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{ color: "rgba(255,255,255,0.6)", background: "rgba(255,255,255,0.1)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)" }}
              aria-label="Close chat"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages — cream background */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0" style={{ background: "#fbf8f5" }}>
            {messages.length === 0 && (
              <p className="text-center text-xs mt-4" style={{ color: "#74635e" }}>
                Ask me anything about enrollment.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className="max-w-[84%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                  style={
                    msg.role === "user"
                      ? { background: "#9B1B1B", color: "#ffffff", borderTopRightRadius: "4px" }
                      : { background: "#ffffff", color: "#2b1716", borderTopLeftRadius: "4px", border: "1px solid #eadfd8" }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="px-3.5 py-2.5 rounded-2xl"
                  style={{ background: "#ffffff", border: "1px solid #eadfd8", borderTopLeftRadius: "4px" }}
                >
                  <div className="flex gap-1 items-center h-4">
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ background: "#74635e" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ background: "#74635e" }} />
                    <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: "#74635e" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area — white card */}
          <div
            className="shrink-0 px-4 pb-4 pt-3"
            style={{ borderTop: "1px solid #eadfd8", background: "#ffffff" }}
          >
            {/* Chips */}
            {chipsShown && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {CHIPS.map(chip => (
                  <button
                    key={chip}
                    onClick={() => sendText(chip)}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors disabled:opacity-40"
                    style={{
                      background: "#f9e9e5",
                      border:     "1px solid #eadfd8",
                      color:      "#74635e",
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.borderColor = "#9B1B1B"
                      el.style.color       = "#9B1B1B"
                      el.style.background  = "#f9e9e5"
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement
                      el.style.borderColor = "#eadfd8"
                      el.style.color       = "#74635e"
                      el.style.background  = "#f9e9e5"
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Text input row */}
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2 transition-all"
              style={{ background: "#fbf8f5", border: "1px solid #eadfd8" }}
              onFocus={() => {}}
            >
              <input
                className="flex-1 text-[13px] outline-none bg-transparent placeholder:text-[#74635e]/60"
                style={{ color: "#2b1716" }}
                placeholder="Ask something about enrollment…"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendText(input.trim())}
                disabled={loading}
              />
              <button
                onClick={() => sendText(input.trim())}
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-30 active:scale-95 transition-all shrink-0"
                style={{ background: "#9B1B1B" }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bubble button ──────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open AI Assistant"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-transform active:scale-95"
        style={{
          background: "linear-gradient(135deg, #9B1B1B 0%, #6E0A0E 100%)",
          boxShadow:  "0 0 0 3px rgba(155,27,27,0.35), 0 4px 20px rgba(155,27,27,0.45)",
        }}
      >
        {open
          ? <ChevronDown className="w-6 h-6 text-white" />
          : <MessageCircle className="w-6 h-6 text-white" />
        }
      </button>
    </>
  )
}
