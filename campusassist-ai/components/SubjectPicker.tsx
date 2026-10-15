"use client"

import type { Subject } from "@/types"

interface SubjectPickerProps {
  subjects: Subject[]
  selected: string[]
  onChange: (codes: string[]) => void
  error?:   string
}

export function SubjectPicker({ subjects, selected, onChange, error }: SubjectPickerProps) {
  const yearLevels = Array.from(new Set(subjects.map(s => s.year_level)))

  function toggle(code: string) {
    onChange(
      selected.includes(code)
        ? selected.filter(c => c !== code)
        : [...selected, code]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-gray-500">
          Click to select subjects for your enrollment
        </p>
        {selected.length > 0 && (
          <span className="text-[11px] font-semibold text-[#9B1B1B] bg-[#9B1B1B]/[0.08] border border-[#9B1B1B]/20 px-2 py-0.5 rounded-full">
            {selected.length} selected
          </span>
        )}
      </div>

      {yearLevels.map(level => (
        <div key={level}>
          <h3 className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2">{level}</h3>
          <div className="space-y-1.5">
            {subjects.filter(s => s.year_level === level).map(subject => {
              const checked = selected.includes(subject.code)
              return (
                <label
                  key={subject.code}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    checked
                      ? "border-[#9B1B1B] bg-[#9B1B1B]/[0.04] shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(subject.code)}
                    className="accent-[#9B1B1B] w-4 h-4 shrink-0"
                  />
                  <span className={`flex-1 text-[13px] font-medium ${checked ? "text-[#9B1B1B]" : "text-gray-800"}`}>
                    {subject.name}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono shrink-0">{subject.code}</span>
                  <span className="text-[11px] text-gray-400 shrink-0">{subject.units}u</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      {error && (
        <p className="flex items-center gap-1 text-[12px] text-red-500 mt-1">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}
