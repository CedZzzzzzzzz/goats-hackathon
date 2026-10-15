import type { Metadata } from "next"
import "./globals.css"
import { RoleProvider } from "@/components/RoleToggle"

export const metadata: Metadata = {
  title:       "CampusAssist AI",
  description: "Student enrollment portal for BSIT",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <RoleProvider>
          {children}
        </RoleProvider>
      </body>
    </html>
  )
}