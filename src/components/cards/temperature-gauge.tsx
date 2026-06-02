"use client"

import { cn } from "@/lib/utils"

interface TemperatureGaugeProps {
  value: number // 0-100
  label?: string
}

export function TemperatureGauge({ value, label }: TemperatureGaugeProps) {
  const getColor = (v: number) => {
    if (v < 30) return "text-blue-400"
    if (v < 50) return "text-green-400"
    if (v < 70) return "text-yellow-400"
    return "text-red-400"
  }

  const getLabel = (v: number) => {
    if (v < 20) return "Very Cold"
    if (v < 40) return "Cool"
    if (v < 60) return "Neutral"
    if (v < 80) return "Warm"
    return "Hot"
  }

  return (
    <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
      <span className="text-sm text-zinc-400">{label || "Market Temperature"}</span>
      <div className={cn("text-4xl font-bold", getColor(value))}>{value}</div>
      <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", {
            "bg-blue-400": value < 30,
            "bg-green-400": value >= 30 && value < 50,
            "bg-yellow-400": value >= 50 && value < 70,
            "bg-red-400": value >= 70,
          })}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={cn("text-xs font-medium", getColor(value))}>
        {getLabel(value)}
      </span>
    </div>
  )
}
