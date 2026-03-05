'use client'

import { LANGUAGES, type LanguageCode } from '@/lib/i18n'

interface LanguageSelectorProps {
  value: LanguageCode
  onChange: (next: LanguageCode) => void
  className?: string
}

export default function LanguageSelector({ value, onChange, className = '' }: LanguageSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LanguageCode)}
      className={`rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs text-neutral-700 ${className}`}
      aria-label="Language"
    >
      {LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  )
}
