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
      <p className="text-sm text-gray-600">
        Select subjects for your enrollment ({selected.length} selected)
      </p>
      {yearLevels.map(level => (
        <div key={level}>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{level}</h3>
          <div className="space-y-2">
            {subjects.filter(s => s.year_level === level).map(subject => {
              const checked = selected.includes(subject.code)
              return (
                <label
                  key={subject.code}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(subject.code)}
                    className="accent-indigo-600"
                  />
                  <span className="flex-1 text-sm font-medium">{subject.name}</span>
                  <span className="text-xs text-gray-500">{subject.code}</span>
                  <span className="text-xs text-gray-400">{subject.units} units</span>
                </label>
              )
            })}
          </div>
        </div>
      ))}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
