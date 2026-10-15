import Link from "next/link"

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center py-16 space-y-6">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm px-4 py-1.5 rounded-full font-medium">
          BSIT · AY 2025–2026 · 1st Semester
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Enroll smarter with<br />
          <span className="text-indigo-600">AI-guided enrollment</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          CampusAssist AI helps regular and irregular students navigate the enrollment process — auto-assigns your subjects, answers your questions, and keeps you updated on your status.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/enroll"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-base"
          >
            Start Enrollment →
          </Link>
          <Link
            href="/chat"
            className="bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors text-base"
          >
            Ask AI
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon:  "⚡",
            title: "Auto-confirm for Regular students",
            desc:  "Regular students are automatically assigned their prescribed curriculum and confirmed instantly.",
          },
          {
            icon:  "📋",
            title: "Subject picker for Irregular students",
            desc:  "Irregular students pick their subjects and submit for staff review — with live status tracking.",
          },
          {
            icon:  "🤖",
            title: "AI assistant that cites its sources",
            desc:  "Get answers from a curated knowledge base. The AI never guesses and always shows where its answer came from.",
          },
        ].map(f => (
          <div key={f.title} className="border border-gray-200 rounded-xl p-6 space-y-3">
            <div className="text-3xl">{f.icon}</div>
            <h2 className="font-semibold text-gray-900">{f.title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
        <ol className="space-y-3">
          {[
            "Fill out the enrollment form — name, student ID, year level, and student type.",
            "Regular students are confirmed immediately with auto-assigned subjects.",
            "Irregular students select subjects and wait for staff approval.",
            "Track your enrollment status anytime with your ENR number.",
            "Use the AI assistant to answer any enrollment-related questions.",
          ].map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-gray-600 text-sm leading-relaxed">{step}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
