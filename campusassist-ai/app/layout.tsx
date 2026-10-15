import type { Metadata } from "next"
import "./globals.css"
import { RoleProvider } from "@/components/RoleToggle"
import { AppShell }     from "@/components/AppShell"
import { HeaderBar }    from "@/components/HeaderBar"

export const metadata: Metadata = {
  title:       "PUPILA · CampusAssist AI",
  description: "Student enrollment portal for BSIT",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className="antialiased"
        style={{
          fontFamily:      "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
          backgroundColor: "#F4F6FA",
          color:           "#1E2A3A",
          margin:          0,
          padding:         0,
        }}
      >
        <RoleProvider>
          <AppShell header={<HeaderBar />}>
            {children}
          </AppShell>
        </RoleProvider>
      </body>
    </html>
  )
}
