"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { SignalCard } from "@/components/cards/signal-card"
import { TooltipTerm } from "@/components/learning/tooltip-term"
import { formatPrice, formatPercent } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { useState } from "react"

const chartTabs = ["Today", "5D", "1M", "6M", "1Y"] as const

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const [chartTab, setChartTab] = useState<string>("Today")

  const { data: quote } = useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => fetch(`/api/stock/${symbol}/quote`).then((r) => r.json()),
    refetchInterval: 15000,
  })

  const { data: info } = useQuery({
    queryKey: ["info", symbol],
    queryFn: () => fetch(`/api/stock/${symbol}/info`).then((r) => r.json()),
  })

  const { data: intraday } = useQuery({
    queryKey: ["intraday", symbol],
    queryFn: () => fetch(`/api/stock/${symbol}/intraday`).then((r) => r.json()),
    enabled: chartTab === "Today",
  })

  const price = parseFloat(quote?.last_done || "0")
  const change = parseFloat(quote?.change_rate || "0") * 100
  const isPositive = change >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{symbol}</h1>
          <p className="text-sm text-zinc-400">{info?.name || "Loading..."}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{formatPrice(price)}</div>
          <div className={cn("text-sm font-medium", isPositive ? "text-green-400" : "text-red-400")}>
            {formatPercent(change)}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-zinc-400">Today&apos;s Story</h2>
          <div className="flex gap-1">
            {chartTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setChartTab(tab)}
                className={cn(
                  "px-3 py-1 rounded text-xs font-medium transition-colors",
                  chartTab === tab ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-white"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Chart placeholder */}
        <div className="h-64 flex items-center justify-center border border-dashed border-zinc-700 rounded-lg">
          <p className="text-zinc-500 text-sm">
            {intraday ? `${intraday.lines?.length || 0} data points loaded` : "Loading chart data..."}
          </p>
        </div>

        {/* Auto-generated summary */}
        <div className="mt-4 p-3 rounded-lg bg-zinc-800/50">
          <p className="text-sm text-zinc-300">
            {quote
              ? `${symbol} is currently at ${formatPrice(price)}, ${isPositive ? "up" : "down"} ${formatPercent(change)} today.`
              : "Loading summary..."}
          </p>
        </div>
      </section>

      {/* Signal Cards */}
      <section>
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Key Signals</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SignalCard
            title="Volume"
            value={quote?.volume ? `${(parseInt(quote.volume) / 1000000).toFixed(1)}M` : "--"}
            sentiment="neutral"
            explanation="Number of shares traded today. Higher volume means more interest in the stock."
          />
          <SignalCard
            title="Trend"
            value={isPositive ? "Upward" : "Downward"}
            sentiment={isPositive ? "bullish" : "bearish"}
            explanation="The general direction the stock price is moving today."
          />
          <SignalCard
            title="Day Range"
            value={quote ? `${formatPrice(parseFloat(quote.low || "0"))} - ${formatPrice(parseFloat(quote.high || "0"))}` : "--"}
            sentiment="neutral"
            explanation="The lowest and highest prices the stock has traded at today."
          />
          <SignalCard
            title="Market Cap"
            value={info?.market_cap || "--"}
            sentiment="neutral"
            explanation="Total value of all the company's shares. Larger = more stable (usually)."
          />
        </div>
      </section>

      {/* Overview */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">About</h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {info?.description || "Loading company description..."}
        </p>

        {info && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-zinc-500"><TooltipTerm termKey="pe">P/E Ratio</TooltipTerm></div>
              <div className="text-sm font-medium text-white">{info.pe || "--"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500"><TooltipTerm termKey="marketCap">Market Cap</TooltipTerm></div>
              <div className="text-sm font-medium text-white">{info.market_cap || "--"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Industry</div>
              <div className="text-sm font-medium text-white">{info.industry || "--"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Employees</div>
              <div className="text-sm font-medium text-white">{info.employees || "--"}</div>
            </div>
          </div>
        )}
      </section>

      {/* Actions */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
          Add to Watchlist
        </button>
        <button className="px-4 py-2 border border-zinc-700 hover:border-zinc-500 rounded-lg text-sm font-medium transition-colors">
          Set Alert
        </button>
      </div>
    </div>
  )
}
