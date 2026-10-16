import { ChatWindow } from "@/components/ChatWindow"

export default function ChatPage() {
  return (
    /*
     * The app shell (body → header + row → main) is already height: 100dvh,
     * overflow: hidden, with every flex ancestor having flex: 1 1 0 and
     * min-height: 0.  This div just needs to fill main completely and pass
     * that bounded height down to ChatWindow.
     */
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        height:        "100%",
        minHeight:     0,
        overflow:      "hidden",
      }}
    >
      {/* Page header — flex: 0 0 auto, never shrinks or scrolls */}
      <div
        style={{
          flex:            "0 0 auto",
          padding:         "20px 28px 14px",
          borderBottom:    "1px solid #EEF0F5",
          backgroundColor: "#F4F6FA",
        }}
      >
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#1E2A3A", margin: 0 }}>
          Ask the AI Assistant
        </h1>
        <p style={{ fontSize: "13px", color: "#6B7A8C", marginTop: "4px", marginBottom: 0 }}>
          Ask anything about enrollment — the AI answers from a curated knowledge base.
        </p>
      </div>

      {/* Chat card — flex: 1 1 0, min-height: 0 so it doesn't escape the parent */}
      <div
        style={{
          flex:      "1 1 0",
          minHeight: 0,
          padding:   "16px 28px",
          overflow:  "hidden",
        }}
      >
        <div
          style={{
            display:       "flex",
            flexDirection: "column",
            height:        "100%",
            minHeight:     0,
            maxWidth:      "720px",
            margin:        "0 auto",
            borderRadius:  "16px",
            overflow:      "hidden",
            boxShadow:     "0 4px 24px rgba(0,0,0,0.07)",
            border:        "1px solid #EEF0F5",
          }}
        >
          <ChatWindow />
        </div>
      </div>
    </div>
  )
}
