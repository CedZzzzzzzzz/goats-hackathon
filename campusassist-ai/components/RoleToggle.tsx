"use client"

import { createContext, useContext, useState, ReactNode } from "react"

interface RoleContextValue {
  isStaff:    boolean
  toggleRole: () => void
}

const RoleContext = createContext<RoleContextValue>({
  isStaff:    false,
  toggleRole: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [isStaff, setIsStaff] = useState(false)
  const toggleRole = () => setIsStaff(prev => !prev)
  return (
    <RoleContext.Provider value={{ isStaff, toggleRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}

export function RoleToggle() {
  return (
    <button
      className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-bold transition-all duration-200"
      style={{
        color:           "#FFFFFF",
        backgroundColor: "transparent",
        border:          "2px solid #FFFFFF",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.15)" }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent" }}
    >
      LOG OUT
    </button>
  )
}
