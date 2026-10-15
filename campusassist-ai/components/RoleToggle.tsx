"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

interface RoleContextValue {
  isStaff: boolean
  toggleRole: () => void
}

const RoleContext = createContext<RoleContextValue>({
  isStaff: false,
  toggleRole: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [isStaff, setIsStaff] = useState(false)
  const toggleRole = () => setIsStaff(previous => !previous)
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
  const router = useRouter()
  const pathname = usePathname()

  function handleToggle() {
    toggleRole()
    router.push(isStaff ? "/" : "/admin")
  }

  return (
    <button
      onClick={handleToggle}
      className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
        pathname.startsWith("/admin")
          ? "border-pupila-line bg-pupila-card hover:bg-pupila-soft text-pupila-ink"
          : "border-white/30 bg-white/15 hover:bg-white/25 text-white"
      }`}
    >
      {isStaff ? "Student View" : "Admin View"}
    </button>
  )
}
