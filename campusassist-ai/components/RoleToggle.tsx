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
      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
        isStaff
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {isStaff ? "👤 Staff View" : "🎓 Student View"}
    </button>
  )
}
