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
  const { isStaff, toggleRole } = useRole()
  return (
    <button
      onClick={toggleRole}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
        isStaff
          ? "bg-white/15 text-white border-white/30 hover:bg-white/25"
          : "bg-white/15 text-white border-white/30 hover:bg-white/25"
      }`}
    >
      {isStaff ? (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
          Staff View
        </>
      ) : (
        <>
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
          </svg>
          Student View
        </>
      )}
    </button>
  )
}
