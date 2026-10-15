import type { Metadata } from "next"
import "./globals.css"
import { RoleProvider } from "@/components/RoleToggle"

export const metadata: Metadata = {
  title: "PUPILA · CampusAssist AI",
  description: "Student enrollment portal for BSIT",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F6FA] text-gray-900 antialiased font-sans">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  )
}
