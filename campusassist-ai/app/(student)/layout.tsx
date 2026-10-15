import Link from "next/link"
import { RoleToggle } from "@/components/RoleToggle"

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-indigo-700 tracking-tight">
            CampusAssist AI
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/enroll" className="text-gray-600 hover:text-indigo-600 transition-colors">Enroll</Link>
            <Link href="/chat"   className="text-gray-600 hover:text-indigo-600 transition-colors">Ask AI</Link>
            <Link href="/admin"  className="text-gray-600 hover:text-indigo-600 transition-colors">Admin</Link>
            <RoleToggle />
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </>
  )
}