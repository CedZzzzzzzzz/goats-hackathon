"use client"

import Link from "next/link"
import { Search, MessageCircle, X, RefreshCw } from "lucide-react"
import { useState, useRef } from "react"
import { EnrollmentCard } from "@/components/EnrollmentCard"
import { StatusTimeline } from "@/components/StatusTimeline"
import type { Enrollment } from "@/types"

export default function HomePage() {
  const [modalOpen,  setModalOpen]  = useState(false)
  const [enrInput,   setEnrInput]   = useState("")
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [fetching,   setFetching]   = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function openModal() {
    setModalOpen(true)
    setEnrollment(null)
    setFetchError(null)
    setEnrInput("")
    // focus the input on next frame
    setTimeout(() => inputRef.current?.focus(), 60)
  }

  function closeModal() {
    setModalOpen(false)
  }

  async function handleTrack(e?: React.FormEvent) {
    e?.preventDefault()
    const enr = enrInput.trim().toUpperCase()
    if (!enr) return
    setFetching(true)
    setFetchError(null)
    setEnrollment(null)
    try {
      const res = await fetch(`/api/enrollments/${encodeURIComponent(enr)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setFetchError((data as { error?: string }).error ?? "Enrollment not found.")
        return
      }
      setEnrollment(await res.json())
    } catch {
      setFetchError("Network error. Please try again.")
    } finally {
      setFetching(false)
    }
  }

  return (
    <>
    {/* ── Track Enrollment Modal ── */}
    {modalOpen && (
      <div
        onClick={closeModal}
        style={{
          position:        "fixed",
          inset:           0,
          zIndex:          50,
          backgroundColor: "rgba(15,20,30,0.45)",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          padding:         "16px",
          backdropFilter:  "blur(2px)",
        }}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius:    "20px",
            width:           "100%",
            maxWidth:        "500px",
            maxHeight:       "90vh",
            overflowY:       "auto",
            boxShadow:       "0 24px 64px rgba(0,0,0,0.18)",
            display:         "flex",
            flexDirection:   "column",
          }}
        >
          {/* Modal header */}
          <div
            style={{
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "space-between",
              padding:         "20px 24px 16px",
              borderBottom:    "1px solid #EEF0F5",
              position:        "sticky",
              top:             0,
              backgroundColor: "#FFFFFF",
              zIndex:          1,
              borderRadius:    "20px 20px 0 0",
            }}
          >
            <div>
              <p style={{ fontSize: "16px", fontWeight: 700, color: "#1E2A3A", margin: 0 }}>
                Track Enrollment
              </p>
              <p style={{ fontSize: "12px", color: "#6B7A8C", margin: "2px 0 0" }}>
                Enter your ENR number to check your status
              </p>
            </div>
            <button
              onClick={closeModal}
              aria-label="Close"
              style={{
                display:         "flex",
                alignItems:      "center",
                justifyContent:  "center",
                width:           "32px",
                height:          "32px",
                borderRadius:    "50%",
                border:          "none",
                background:      "#F4F6FA",
                cursor:          "pointer",
                color:           "#6B7A8C",
                flexShrink:      0,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal body */}
          <div style={{ padding: "20px 24px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* ENR input */}
            <form onSubmit={handleTrack} style={{ display: "flex", gap: "8px" }}>
              <input
                ref={inputRef}
                value={enrInput}
                onChange={e => setEnrInput(e.target.value)}
                placeholder="e.g. ENR-00001-MN-0"
                style={{
                  flex:         1,
                  border:       "1px solid #E5E9F0",
                  borderRadius: "10px",
                  padding:      "10px 14px",
                  fontSize:     "13px",
                  color:        "#1E2A3A",
                  outline:      "none",
                  fontFamily:   "monospace",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#8B1A1A")}
                onBlur={e  => (e.currentTarget.style.borderColor = "#E5E9F0")}
              />
              <button
                type="submit"
                disabled={fetching || !enrInput.trim()}
                style={{
                  display:         "flex",
                  alignItems:      "center",
                  gap:             "6px",
                  padding:         "10px 18px",
                  borderRadius:    "10px",
                  border:          "none",
                  background:      "linear-gradient(135deg, #8B1A1A 0%, #A31F1F 100%)",
                  color:           "#FFFFFF",
                  fontSize:        "13px",
                  fontWeight:      600,
                  cursor:          fetching || !enrInput.trim() ? "default" : "pointer",
                  opacity:         fetching || !enrInput.trim() ? 0.55 : 1,
                  flexShrink:      0,
                  transition:      "opacity 0.15s",
                }}
              >
                {fetching
                  ? <RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} />
                  : <Search size={13} />}
                Track
              </button>
            </form>

            {/* Error */}
            {fetchError && (
              <div
                style={{
                  display:         "flex",
                  alignItems:      "center",
                  gap:             "8px",
                  padding:         "10px 14px",
                  borderRadius:    "10px",
                  backgroundColor: "#FFF1F1",
                  border:          "1px solid #FECACA",
                  fontSize:        "13px",
                  color:           "#B91C1C",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {fetchError}
              </div>
            )}

            {/* Results */}
            {enrollment && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Status banner */}
                <div
                  style={{
                    padding:      "14px 16px",
                    borderRadius: "12px",
                    backgroundColor:
                      enrollment.status === "confirmed" ? "#F0FDF4" :
                      enrollment.status === "rejected"  ? "#FFF1F1" : "#FFFBEB",
                    border: `1px solid ${
                      enrollment.status === "confirmed" ? "#BBF7D0" :
                      enrollment.status === "rejected"  ? "#FECACA" : "#FDE68A"
                    }`,
                  }}
                >
                  <StatusTimeline status={enrollment.status} studentType={enrollment.student_type} />
                </div>

                {/* Student info */}
                <div
                  style={{
                    borderRadius: "12px",
                    border:       "1px solid #EEF0F5",
                    overflow:     "hidden",
                  }}
                >
                  <div
                    style={{
                      padding:         "8px 14px",
                      backgroundColor: "#F8F9FB",
                      borderBottom:    "1px solid #EEF0F5",
                      fontSize:        "10px",
                      fontWeight:      700,
                      letterSpacing:   "0.10em",
                      textTransform:   "uppercase",
                      color:           "#6B7A8C",
                    }}
                  >
                    Student Info
                  </div>
                  {[
                    ["Name",          enrollment.full_name],
                    ["Student ID",    enrollment.student_id],
                    ["Type",          enrollment.student_type],
                    ["Year Level",    enrollment.year_level],
                    ["Program",       enrollment.program],
                    ["Semester",      enrollment.semester],
                    ["Academic Year", enrollment.academic_year],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      style={{
                        display:      "flex",
                        gap:          "12px",
                        padding:      "8px 14px",
                        fontSize:     "13px",
                        borderBottom: "1px solid #F4F6FA",
                      }}
                    >
                      <span style={{ width: "100px", flexShrink: 0, color: "#6B7A8C" }}>{label}</span>
                      <span style={{ color: "#1E2A3A", fontWeight: 500, textTransform: "capitalize" }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Subjects */}
                {enrollment.subjects?.length > 0 && (
                  <div
                    style={{
                      borderRadius: "12px",
                      border:       "1px solid #EEF0F5",
                      overflow:     "hidden",
                    }}
                  >
                    <div
                      style={{
                        padding:         "8px 14px",
                        backgroundColor: "#F8F9FB",
                        borderBottom:    "1px solid #EEF0F5",
                        fontSize:        "10px",
                        fontWeight:      700,
                        letterSpacing:   "0.10em",
                        textTransform:   "uppercase",
                        color:           "#6B7A8C",
                      }}
                    >
                      Enrolled Subjects
                    </div>
                    {enrollment.subjects.map(s => (
                      <div
                        key={s.code}
                        style={{
                          display:      "flex",
                          alignItems:   "center",
                          gap:          "10px",
                          padding:      "9px 14px",
                          fontSize:     "13px",
                          borderBottom: "1px solid #F4F6FA",
                        }}
                      >
                        <span
                          style={{
                            fontFamily:  "monospace",
                            fontSize:    "12px",
                            color:       "#8B1A1A",
                            fontWeight:  600,
                            width:       "56px",
                            flexShrink:  0,
                          }}
                        >
                          {s.code}
                        </span>
                        <span style={{ flex: 1, color: "#1E2A3A" }}>{s.name}</span>
                        <span style={{ color: "#9BA4B0", fontSize: "12px", flexShrink: 0 }}>{s.units} units</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Refresh row */}
                <button
                  onClick={() => void handleTrack()}
                  style={{
                    display:      "flex",
                    alignItems:   "center",
                    justifyContent: "center",
                    gap:          "6px",
                    padding:      "9px",
                    borderRadius: "10px",
                    border:       "1px solid #E5E9F0",
                    background:   "#F8F9FB",
                    fontSize:     "12px",
                    fontWeight:   600,
                    color:        "#6B7A8C",
                    cursor:       "pointer",
                  }}
                >
                  <RefreshCw size={12} />
                  Refresh status
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* ── Home content (responsive padding via .home-content) ── */}
    <div className="home-content flex-1 flex flex-col" style={{ position: "relative" }}>

      {/* Decorative blobs clipped inside container */}
      <div className="blobs-container" aria-hidden="true">
        <div
          style={{
            position:     "absolute",
            top:          "-60px",
            right:        "-80px",
            width:        "480px",
            height:       "480px",
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(245,179,1,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position:     "absolute",
            bottom:       "60px",
            left:         "-80px",
            width:        "400px",
            height:       "400px",
            borderRadius: "50%",
            background:   "radial-gradient(circle, rgba(139,26,26,0.08) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* All content sits above blobs */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* 1 ── Hero ── */}
        <div className="anim-hero" style={{ marginBottom: "44px" }}>
          <h1 className="hero-title">
            Start your{" "}
            <span className="text-grad">enrollment</span>
          </h1>
          <p className="hero-subtitle">
            Choose your enrollment type to begin. You can track your status
            anytime with your{" "}
            <span style={{ color: "#8B1A1A", fontWeight: 600 }}>ENR number</span>.
          </p>
        </div>

        {/* 2 ── Enrollment cards ── */}
        <div className="enroll-cards-row">
          <EnrollmentCard type="regular"   animClass="anim-card-1" />
          <EnrollmentCard type="irregular" animClass="anim-card-2" />
        </div>

        {/* 3 ── Quick links ── */}
        <div className="quick-links-row">
          <button onClick={openModal} className="quick-pill" style={{ border: "1px solid #E5E9F0" }}>
            <Search size={14} />
            Track enrollment
          </button>
          <Link href="/chat" className="quick-pill">
            <MessageCircle size={14} />
            Ask AI about enrollment
          </Link>
        </div>

      </div>
    </div>
    </>
  )
}
