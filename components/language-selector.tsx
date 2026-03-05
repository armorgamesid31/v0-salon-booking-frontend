'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { LANGUAGES, type LanguageCode } from '@/lib/i18n'

interface LanguageSelectorProps {
  value: LanguageCode
  onChange: (next: LanguageCode) => void
  className?: string
}

export default function LanguageSelector({ value, onChange, className = '' }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const active = LANGUAGES.find((lang) => lang.code === value)

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white/95 px-3 py-1.5 text-xs font-medium text-neutral-700 shadow-sm backdrop-blur"
        aria-label="Change language"
      >
        <Globe className="h-3.5 w-3.5" />
        <span>{active?.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                onChange(lang.code)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs ${
                value === lang.code ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              <span>{lang.label}</span>
              <span>{lang.code.toUpperCase()}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
