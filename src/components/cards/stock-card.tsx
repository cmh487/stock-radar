"use client"

import { cn, formatPrice, formatPercent } from "@/lib/utils"
import Link from "next/link"

interface StockCardProps {
  symbol: string
  name: string
  price: number
  changePercent: number
  reason?: string
  compact?: boolean
}

export function StockCard({ symbol, name, price, changePercent, reason, compact }: StockCardProps) {
  const isPositive = changePercent >= 0

  return (
    <Link href={`/stock/${symbol}`}>
      <div className={cn(
        "p-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 transition-colors cursor-pointer",
        compact && "p-3"
      )}>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-semibold text-white">{symbol}</span>
            <p className="text-xs text-zinc-400 truncate max-w-[140px]">{name}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-white">{formatPrice(price)}</div>
            <div className={cn("text-xs font-medium", isPositive ? "text-green-400" : "text-red-400")}>
              {formatPercent(changePercent)}
            </div>
          </div>
        </div>
        {reason && (
          <p className="mt-2 text-xs text-zinc-500 line-clamp-1">{reason}</p>
        )}
      </div>
    </Link>
  )
}
