"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  function handleToggle() {
    toggleRole()
    if (isStaff) {
      // switching to Student View — go to student portal
      router.push("/")
    } else {
      // switching to Staff View — go to admin dashboard
      router.push("/admin")
    }
  }

  return (
    <button
      onClick={handleToggle}
      className="border border-pupila-line bg-pupila-card hover:bg-pupila-soft text-pupila-ink rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
    >
      {isStaff ? "Student View" : "Admin View"}
    </button>
  )
}
