import Link from "next/link"

export default function HomePage() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-white via-neutral-50 to-rose-50">

      {/* Background logo watermark */}
      <div className="absolute -left-16 top-10 w-[480px] h-[390px] opacity-[0.06] pointer-events-none bg-brand-crimson rounded-full" />

      {/* SVG Swoosh banner */}
      <svg
        className="absolute bottom-6 left-3 right-0 w-[calc(100%-.75rem)] h-[52%] hidden lg:block drop-shadow-[0_20px_30px_rgba(110,10,14,.25)]"
        viewBox="0 0 1440 400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="g" x1="0" x2="1">
            <stop offset="0" stopColor="#A10F14" />
            <stop offset="1" stopColor="#6E0A0E" />
          </linearGradient>
          <radialGradient id="h" cx="85%" cy="0%" r="60%">
            <stop offset="0" stopColor="#E23B3B" stopOpacity=".45" />
            <stop offset="1" stopColor="#E23B3B" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M0 250 Q0 212 40 200 L980 78 Q1010 74 1040 74 L1440 74 L1440 400 L40 400 Q0 400 0 360 Z" fill="url(#g)" />
        <path d="M0 250 Q0 212 40 200 L980 78 Q1010 74 1040 74 L1440 74 L1440 400 L40 400 Q0 400 0 360 Z" fill="url(#h)" />
      </svg>

      <div className="relative max-w-7xl mx-auto px-4 md:px-12 pt-12 pb-10 lg:min-h-[740px]">
        <div className="grid lg:grid-cols-12 gap-10 items-start">

          {/* Left — hero text */}
          <div className="lg:col-span-6 space-y-5 relative z-10">
            <p className="text-[11px] font-extrabold text-brand-crimson">
              Welcome to CampusAssist AI – Official Online Enrollment Portal
            </p>
            <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/15 border border-brand-gold/30 text-[11px] font-extrabold tracking-wider text-amber-800 uppercase">
              BSIT · AY 2025–2026 · 1st Semester
            </span>
            <h1 className="text-4xl md:text-[44px] lg:text-[48px] leading-[1.08] font-extrabold text-brand-navy tracking-tight">
              Enroll smarter with
              <span className="block md:whitespace-nowrap pb-1 bg-gradient-to-r from-brand-crimson via-red-600 to-brand-gold bg-clip-text text-transparent">
                AI-guided enrollment
              </span>
            </h1>
            <p className="text-sm md:text-[15px] text-gray-600 leading-relaxed max-w-md">
              CampusAssist AI helps regular and irregular students navigate the enrollment process — auto-assigns your subjects, answers your questions, and keeps you updated on your status.
            </p>
            <div className="flex flex-wrap items-center gap-5 pt-1">
              <Link
                href="/enroll"
                className="px-7 py-3.5 rounded-full bg-brand-crimson hover:bg-brand-dark text-white text-sm font-extrabold shadow-lg shadow-brand-crimson/30 hover:-translate-y-0.5 transition"
              >
                Start Enrollment →
              </Link>
              <Link
                href="/chat"
                className="px-6 py-3 rounded-full bg-white border border-gray-200 shadow-sm text-sm font-bold text-gray-700 hover:text-brand-crimson hover:border-brand-crimson transition"
              >
                Ask AI
              </Link>
            </div>
          </div>

          {/* Right — photo collage */}
          <div className="lg:col-span-6 relative h-[440px] md:h-[480px] z-10">

            {/* Large campus building — bottom-left */}
            <div className="photo absolute left-0 top-16 w-[62%] h-[300px] md:h-[330px] rounded-[1.75rem] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=700"
                alt="Campus building"
              />
            </div>

            {/* Graduates — top-right */}
            <div className="photo absolute right-0 top-0 w-[42%] h-[175px] md:h-[195px] rounded-3xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1523580494863-6f303122450f?auto=format&fit=crop&q=80&w=500"
                alt="Graduates"
              />
            </div>

            {/* Campus hall — mid-right */}
            <div className="photo absolute right-3 top-[200px] md:top-[220px] w-[38%] h-[190px] md:h-[210px] rounded-3xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=500"
                alt="Campus hall"
              />
            </div>

            {/* Floating crest badge */}
            <div className="fl absolute left-[42%] top-0 z-20 w-32 h-32 rounded-full bg-white border-4 border-brand-gold shadow-2xl flex items-center justify-center">
              <div className="flex flex-col items-center justify-center text-brand-crimson">
                <svg className="w-10 h-10 text-brand-gold" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <span className="text-[8px] font-extrabold uppercase tracking-wider text-brand-crimson mt-1">PUPila</span>
              </div>
            </div>

            {/* Glass enrollment chip */}
            <div className="glass absolute left-[34%] bottom-4 z-20 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 text-xs font-bold text-white shadow-xl">
              <span className="flex -space-x-2">
                <span className="w-6 h-6 rounded-full bg-rose-200 border-2 border-white/80" />
                <span className="w-6 h-6 rounded-full bg-brand-gold border-2 border-white/80" />
                <span className="w-6 h-6 rounded-full bg-white border-2 border-white/80" />
              </span>
              42+ enrolled in the last hour
            </div>

          </div>
        </div>

        {/* Info band — on top of swoosh on desktop, card on mobile */}
        <div className="mt-10 lg:mt-0 lg:absolute lg:left-14 lg:bottom-14 lg:w-[54%] rounded-3xl bg-gradient-to-r from-brand-crimson to-brand-dark lg:bg-none p-6 lg:p-0 grid sm:grid-cols-2 gap-8 sm:gap-0 relative z-10 text-white">

          {/* Column 1 */}
          <div className="sm:pr-8 flex gap-4">
            <div className="shrink-0 w-11 h-11 rounded-full bg-white/10 border border-white/25 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold leading-tight tracking-tight">Enrollment is Now Open</h3>
              <p className="mt-1.5 text-xs text-white/80 leading-relaxed">
                Apply from <b className="text-brand-gold">July 15 to August 30, 2025</b>. Regular and irregular modules are live.
              </p>
              <Link href="/enroll" className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-gold hover:gap-2 transition-all">
                Learn more <span>→</span>
              </Link>
            </div>
          </div>

          {/* Column 2 */}
          <div className="sm:pl-8 sm:border-l sm:border-white/20 flex gap-4">
            <div className="shrink-0 w-11 h-11 rounded-full bg-white/10 border border-white/25 flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold leading-tight tracking-tight">AI-Guided Deadlines</h3>
              <p className="mt-1.5 text-xs text-white/80 leading-relaxed">
                Verify your curriculum match before <b className="text-brand-gold">September 12, 2025</b>. Support handles schedule issues online.
              </p>
              <Link href="/chat" className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider text-brand-gold hover:gap-2 transition-all">
                Key deadlines <span>→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
