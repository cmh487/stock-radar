"use client"

import { glossary, type GlossaryEntry } from "@/lib/constants"
import { useState } from "react"

interface TooltipTermProps {
  termKey: string
  children: React.ReactNode
}

export function TooltipTerm({ termKey, children }: TooltipTermProps) {
  const [show, setShow] = useState(false)
  const entry: GlossaryEntry | undefined = glossary[termKey]

  if (!entry) return <>{children}</>

  return (
    <span
      className="relative inline-block border-b border-dashed border-zinc-500 cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg z-50">
          <div className="text-xs font-semibold text-white mb-1">{entry.term}</div>
          <p className="text-xs text-zinc-300">{entry.long}</p>
        </div>
      )}
    </span>
  )
}
