"use client"

import { useState } from "react"

export function StudentViewButton() {
  const [active, setActive] = useState(false)

  return (
    <button
      onClick={() => setActive((prev) => !prev)}
      className={`px-4 py-2 rounded-full font-extrabold transition text-xs ${
        active
          ? "bg-brand-gold text-brand-navy"
          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
      }`}
    >
      🎓 <span>{active ? "Student View: Active" : "Student View"}</span>
    </button>
  )
}
