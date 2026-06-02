"use client"

import { cn } from "@/lib/utils"

interface SignalCardProps {
  title: string
  value: string
  sentiment: "bullish" | "bearish" | "neutral"
  explanation: string
}

export function SignalCard({ title, value, sentiment, explanation }: SignalCardProps) {
  const color = {
    bullish: "border-green-800 bg-green-950/50",
    bearish: "border-red-800 bg-red-950/50",
    neutral: "border-zinc-700 bg-zinc-900",
  }

  const dot = {
    bullish: "bg-green-400",
    bearish: "bg-red-400",
    neutral: "bg-zinc-400",
  }

  return (
    <div className={cn("p-3 rounded-lg border", color[sentiment])}>
      <div className="flex items-center gap-2 mb-1">
        <div className={cn("w-2 h-2 rounded-full", dot[sentiment])} />
        <span className="text-xs font-medium text-zinc-300">{title}</span>
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
      <details className="mt-1">
        <summary className="text-xs text-zinc-500 cursor-pointer hover:text-zinc-300">
          What does this mean?
        </summary>
        <p className="text-xs text-zinc-400 mt-1">{explanation}</p>
      </details>
    </div>
  )
}
