"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Send, ThumbsUp, ThumbsDown, Trash2, ChevronDown } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────
interface ChatMessage {
  role:       "user" | "assistant"
  content:    string
  id:         string
  rating?:    boolean | null
  streaming?: boolean
}

// ── Constants ─────────────────────────────────────────────────────────
const SESSION_KEY      = "campusassist_chat"
const NEAR_BOTTOM_PX   = 80   // px from bottom — within this = "at bottom"

const INITIAL_MESSAGE: ChatMessage = {
  role:    "assistant",
  content: "Hi! I'm CampusAssist AI — your PUPILA enrollment assistant. How can I help you today?",
  id:      "init",
}

const GREETING_CHIPS = [
  "How do I enroll?",
  "Track my status",
  "Required documents",
  "Regular vs Irregular",
  "Show my schedule",
]

const ENR_PATTERN = /ENR-\d{5}-[A-Z]{2}-[01]/i

function uid(): string {
  return Math.random().toString(36).slice(2, 10)
}

// ── Session storage helpers ────────────────────────────────────────────
function loadSession(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return [INITIAL_MESSAGE]
    const parsed = JSON.parse(raw) as ChatMessage[]
    return parsed.map((m) => ({ ...m, streaming: false }))
  } catch {
    return [INITIAL_MESSAGE]
  }
}

function saveSession(msgs: ChatMessage[]): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(msgs))
  } catch { /* quota exceeded — ignore */ }
}

// ── Follow-up suggestion heuristics ───────────────────────────────────
function getFollowUpSuggestions(answer: string): string[] {
  const lower = answer.toLowerCase()
  if (lower.includes("irregular") || lower.includes("pending"))
    return ["How do I check my status?", "What documents do I need?"]
  if (lower.includes("regular") || lower.includes("confirmed"))
    return ["What subjects will I take?", "When do classes start?"]
  if (lower.includes("enr") || lower.includes("track"))
    return ["What does 'pending' mean?", "How long until confirmation?"]
  if (lower.includes("document") || lower.includes("requirements"))
    return ["How do I enroll?", "Contact enrollment office"]
  return []
}

// ── Markdown-lite renderer (bold + newlines) ──────────────────────────
function renderContent(text: string): React.ReactNode {
  return text.split("\n").map((line, li) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    return (
      <span key={li}>
        {li > 0 && <br />}
        {parts.map((part, pi) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={pi}>{part.slice(2, -2)}</strong>
            : part
        )}
      </span>
    )
  })
}

// ── Component ─────────────────────────────────────────────────────────
export function ChatWindow() {
  const [messages,  setMessages]  = useState<ChatMessage[]>(() => {
    if (typeof window !== "undefined") return loadSession()
    return [INITIAL_MESSAGE]
  })
  const [input,     setInput]     = useState("")
  const [loading,   setLoading]   = useState(false)
  const [showChips, setShowChips] = useState(() => {
    if (typeof window !== "undefined") return loadSession().length <= 1
    return true
  })
  const [followUps,       setFollowUps]       = useState<string[]>([])
  const [showScrollBtn,   setShowScrollBtn]   = useState(false)
  const [hasNewMsg,       setHasNewMsg]       = useState(false)

  const listRef   = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef  = useRef<AbortController | null>(null)

  // ── Scroll helpers ─────────────────────────────────────────────────
  const isNearBottom = useCallback((): boolean => {
    const el = listRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX
  }, [])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" })
    setShowScrollBtn(false)
    setHasNewMsg(false)
  }, [])

  // Track scroll position to show/hide the "↓" button
  const handleScroll = useCallback(() => {
    const near = isNearBottom()
    setShowScrollBtn(!near)
    if (near) setHasNewMsg(false)
  }, [isNearBottom])

  // Auto-scroll only when already near the bottom
  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom("smooth")
    } else {
      // User is reading older messages — show the button instead
      setShowScrollBtn(true)
      setHasNewMsg(true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  // Persist to sessionStorage on every change
  useEffect(() => { saveSession(messages) }, [messages])

  // ── Rate message ───────────────────────────────────────────────────
  const rateMessage = useCallback((id: string, rating: boolean) => {
    setMessages((prev) =>
      prev.map((m) => m.id === id ? { ...m, rating: m.rating === rating ? null : rating } : m)
    )
  }, [])

  // ── Clear chat ─────────────────────────────────────────────────────
  const clearChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE])
    setShowChips(true)
    setFollowUps([])
    setShowScrollBtn(false)
    setHasNewMsg(false)
    try { sessionStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
  }, [])

  // ── Send message ────────────────────────────────────────────────────
  const sendText = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setInput("")
    setShowChips(false)
    setFollowUps([])

    const userMsg: ChatMessage = { role: "user", content: trimmed, id: uid() }
    setMessages((prev) => { const next = [...prev, userMsg]; saveSession(next); return next })
    setLoading(true)

    const history = [...messages, userMsg]
      .filter((m) => !m.streaming)
      .map((m) => ({ role: m.role, content: m.content }))

    void trimmed.match(ENR_PATTERN)?.[0]?.toUpperCase() // handled server-side

    const assistantId = uid()
    setMessages((prev) => [
      ...prev,
      { role: "assistant" as const, content: "", id: assistantId, streaming: true },
    ])

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ messages: history }),
        signal:  abortRef.current.signal,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        const errMsg  = (errData as { error?: string }).error ?? "Something went wrong."
        setMessages((prev) => prev.map((m) =>
          m.id === assistantId ? { ...m, content: errMsg, streaming: false } : m
        ))
        return
      }

      const reader  = res.body!.getReader()
      const decoder = new TextDecoder()
      let   buffer  = ""
      let   full    = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const raw = line.slice(6).trim()
          if (!raw) continue
          let event: { type: string; text?: string; message?: string }
          try { event = JSON.parse(raw) } catch { continue }

          if (event.type === "chunk" && event.text) {
            full += event.text
            const snapshot = full
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId ? { ...m, content: snapshot, streaming: true } : m
            ))
          } else if (event.type === "done") {
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId ? { ...m, content: full, streaming: false } : m
            ))
            setFollowUps(getFollowUpSuggestions(full))
          } else if (event.type === "error") {
            const errText = event.message ?? "I'm having trouble right now, please try again."
            setMessages((prev) => prev.map((m) =>
              m.id === assistantId ? { ...m, content: errText, streaming: false } : m
            ))
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return
      setMessages((prev) => prev.map((m) =>
        m.id === assistantId
          ? { ...m, content: "I'm having trouble right now, please try again.", streaming: false }
          : m
      ))
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, messages])

  function handleSend() { void sendText(input) }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    /*
     * Zone layout — three rows that never leak height upward:
     *   1. Chat header bar  — flex: 0 0 auto
     *   2. Message list     — flex: 1 1 0, min-height: 0, overflow-y: auto
     *   3. Input + footer   — flex: 0 0 auto
     */
    <div
      style={{
        display:         "flex",
        flexDirection:   "column",
        height:          "100%",
        minHeight:       0,
        overflow:        "hidden",
        backgroundColor: "#F4F6FA",
      }}
    >

      {/* ── ZONE 1: Chat header (Clear chat) — always visible ── */}
      <div
        style={{
          flex:            "0 0 auto",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "flex-end",
          padding:         "6px 12px 4px",
          backgroundColor: "#F4F6FA",
          minHeight:       "32px",
        }}
      >
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            title="Clear chat"
            style={{
              display:      "flex",
              alignItems:   "center",
              gap:          "4px",
              fontSize:     "11px",
              color:        "#6B7A8C",
              background:   "none",
              border:       "none",
              cursor:       "pointer",
              padding:      "2px 6px",
              borderRadius: "6px",
            }}
          >
            <Trash2 size={11} />
            Clear chat
          </button>
        )}
      </div>

      {/* ── ZONE 2: Message list — the ONLY scrolling element ── */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="chat-messages"
        style={{
          flex:               "1 1 0",
          minHeight:          0,
          overflowY:          "auto",
          overscrollBehavior: "contain",
          padding:            "4px 14px 14px",
          display:            "flex",
          flexDirection:      "column",
          gap:                "12px",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display:        "flex",
              alignItems:     "flex-end",
              gap:            "8px",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {/* AI avatar */}
            {msg.role === "assistant" && (
              <div
                style={{
                  width:           "36px",
                  height:          "36px",
                  borderRadius:    "50%",
                  backgroundColor: "#FBEAEA",
                  display:         "flex",
                  alignItems:      "center",
                  justifyContent:  "center",
                  flexShrink:      0,
                  marginBottom:    "2px",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#8B1A1A">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H7l5-8v4h4l-5 8z"/>
                </svg>
              </div>
            )}

            {/* Bubble wrapper — max 80%, word-wrap fixed */}
            <div style={{ maxWidth: "80%", minWidth: 0 }}>
              {msg.role === "user" ? (
                <div
                  style={{
                    padding:       "10px 14px",
                    borderRadius:  "18px 18px 4px 18px",
                    fontSize:      "13px",
                    lineHeight:    1.5,
                    color:         "#FFFFFF",
                    background:    "linear-gradient(135deg, #8B1A1A 0%, #A31F1F 100%)",
                    boxShadow:     "0 1px 3px rgba(0,0,0,0.10)",
                    overflowWrap:  "anywhere",
                    maxWidth:      "100%",
                  }}
                >
                  {msg.content}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div
                    style={{
                      padding:         "12px 14px",
                      borderRadius:    "20px 20px 20px 4px",
                      fontSize:        "13px",
                      lineHeight:      1.55,
                      color:           "#1E2A3A",
                      backgroundColor: "#FFFFFF",
                      border:          "1px solid #FBEAEA",
                      boxShadow:       "0 2px 8px rgba(0,0,0,0.06)",
                      whiteSpace:      "pre-wrap",
                      overflowWrap:    "anywhere",
                      maxWidth:        "100%",
                    }}
                  >
                    {msg.streaming && msg.content === "" ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "16px" }}>
                        <span className="rounded-full animate-bounce" style={{ width: "6px", height: "6px", backgroundColor: "rgba(139,26,26,0.40)", animationDelay: "-0.3s",  display: "inline-block" }} />
                        <span className="rounded-full animate-bounce" style={{ width: "6px", height: "6px", backgroundColor: "rgba(139,26,26,0.40)", animationDelay: "-0.15s", display: "inline-block" }} />
                        <span className="rounded-full animate-bounce" style={{ width: "6px", height: "6px", backgroundColor: "rgba(139,26,26,0.40)",                           display: "inline-block" }} />
                      </div>
                    ) : (
                      <>
                        {renderContent(msg.content)}
                        {msg.streaming && (
                          <span
                            style={{
                              display:         "inline-block",
                              width:           "2px",
                              height:          "13px",
                              backgroundColor: "#8B1A1A",
                              marginLeft:      "2px",
                              verticalAlign:   "text-bottom",
                              animation:       "blink 1s step-end infinite",
                            }}
                          />
                        )}
                      </>
                    )}
                  </div>

                  {!msg.streaming && msg.id !== "init" && (
                    <div style={{ display: "flex", gap: "6px", paddingLeft: "2px" }}>
                      <button
                        onClick={() => rateMessage(msg.id, true)}
                        title="Helpful"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: msg.rating === true ? "#8B1A1A" : "#B0BAC9", transition: "color 0.15s" }}
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => rateMessage(msg.id, false)}
                        title="Not helpful"
                        style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: msg.rating === false ? "#8B1A1A" : "#B0BAC9", transition: "color 0.15s" }}
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Greeting chips */}
        {showChips && (
          <div className="chips-row" style={{ marginTop: "4px" }}>
            {GREETING_CHIPS.map((s) => (
              <button key={s} className="suggestion-chip" onClick={() => void sendText(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Follow-up chips */}
        {!loading && followUps.length > 0 && (
          <div className="chips-row">
            {followUps.map((s) => (
              <button key={s} className="suggestion-chip" onClick={() => void sendText(s)} disabled={loading}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} style={{ height: 0, flexShrink: 0 }} />
      </div>

      {/* "↓ New messages" scroll-to-bottom button */}
      {showScrollBtn && (
        <div
          style={{
            position:       "relative",
            flex:           "0 0 auto",
            display:        "flex",
            justifyContent: "center",
            marginTop:      "-20px",
            zIndex:         10,
            pointerEvents:  "none",
          }}
        >
          <button
            onClick={() => scrollToBottom("smooth")}
            style={{
              pointerEvents:   "auto",
              display:         "flex",
              alignItems:      "center",
              gap:             "5px",
              fontSize:        "12px",
              fontWeight:      600,
              color:           "#FFFFFF",
              background:      "linear-gradient(135deg, #8B1A1A 0%, #A31F1F 100%)",
              border:          "none",
              borderRadius:    "9999px",
              padding:         "5px 12px 5px 10px",
              cursor:          "pointer",
              boxShadow:       "0 2px 8px rgba(139,26,26,0.35)",
              whiteSpace:      "nowrap",
            }}
          >
            <ChevronDown size={13} />
            {hasNewMsg ? "New messages" : "Scroll to bottom"}
          </button>
        </div>
      )}

      {/* ── ZONE 3: Input bar + footer note — always visible ── */}
      <div
        style={{
          flex:            "0 0 auto",
          padding:         "8px 12px 12px",
          backgroundColor: "#FFFFFF",
          borderTop:       "1px solid #FBEAEA",
        }}
      >
        <div
          style={{
            display:         "flex",
            alignItems:      "center",
            gap:             "8px",
            backgroundColor: "#FFFFFF",
            border:          "1px solid #E5E9F0",
            borderRadius:    "9999px",
            padding:         "8px 8px 8px 16px",
          }}
        >
          <input
            className="flex-1 min-w-0 outline-none"
            style={{
              fontSize:        "16px",
              color:           "#1E2A3A",
              backgroundColor: "transparent",
              border:          "none",
              minWidth:        0,
            }}
            placeholder="Ask AI…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send"
            style={{
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              width:           "32px",
              height:          "32px",
              background:      "linear-gradient(135deg, #8B1A1A 0%, #A31F1F 100%)",
              opacity:         loading || !input.trim() ? 0.45 : 1,
              border:          "none",
              borderRadius:    "50%",
              cursor:          loading || !input.trim() ? "default" : "pointer",
              flexShrink:      0,
              transition:      "opacity 0.15s",
            }}
          >
            <Send size={13} color="#FFFFFF" />
          </button>
        </div>
        <p
          style={{
            textAlign:  "center",
            fontSize:   "11px",
            color:      "#6B7A8C",
            marginTop:  "7px",
            marginBottom: 0,
            lineHeight: 1,
            fontWeight: 500,
          }}
        >
          Answers from curated enrollment content only
        </p>
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        /* Slim scrollbar scoped to the chat message list */
        .chat-messages::-webkit-scrollbar             { width: 6px; }
        .chat-messages::-webkit-scrollbar-track       { background: transparent; }
        .chat-messages::-webkit-scrollbar-thumb       { background: rgba(139,26,26,0.25); border-radius: 9999px; }
        .chat-messages::-webkit-scrollbar-thumb:hover { background: rgba(139,26,26,0.50); }
        .chat-messages                                { scrollbar-width: thin; scrollbar-color: rgba(139,26,26,0.25) transparent; }
      `}</style>
    </div>
  )
}
