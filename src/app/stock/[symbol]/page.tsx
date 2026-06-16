"use client"

import type { IntradayResponse, StockInfo, StockQuote } from "@/app/types"
import { SignalCard } from "@/components/cards/signal-card"
import { TooltipTerm } from "@/components/learning/tooltip-term"
import { useApiQuery } from "@/hooks/useApiQuery"
import { cn, formatPercent, formatPrice } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useState } from "react"

const chartTabs = ["Today", "5D", "1M", "6M", "1Y"] as const

export default function StockDetailPage() {
  const { symbol } = useParams<{ symbol: string }>()
  const [chartTab, setChartTab] = useState<string>("Today")

  const { data: quote } = useApiQuery<StockQuote>(
    ["quote", symbol],
    `/api/stock/${symbol}/quote`,
    { refetchInterval: 15000 }
  )

  const { data: info } = useApiQuery<StockInfo>(
    ["info", symbol],
    `/api/stock/${symbol}/info`
  )

  // intraday() returns IntradayLine[] directly
  const { data: intraday } = useApiQuery<IntradayResponse>(
    ["intraday", symbol],
    `/api/stock/${symbol}/intraday`,
    { enabled: chartTab === "Today" }
  )

  // SDK SecurityQuote fields are camelCase Decimal strings
  const price = parseFloat(quote?.lastDone || "0")
  const prevClose = parseFloat(quote?.prevClose || "0")
  // Use backend-computed changeRate if available, otherwise compute here
  const change = quote?.changeRate
    ? parseFloat(quote.changeRate) * 100
    : prevClose !== 0 ? ((price - prevClose) / prevClose) * 100 : 0
  const isPositive = change >= 0

  // Compute market cap from totalShares × lastDone (staticInfo has no market_cap)
  const marketCap = info && quote
    ? info.totalShares * price
    : null

  const formatMarketCapValue = (cap: number): string => {
    if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`
    if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`
    if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`
    return `$${cap.toFixed(0)}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{symbol}</h1>
          {/* SDK SecurityStaticInfo has nameEn */}
          <p className="text-sm text-zinc-400">{info?.nameEn || "Loading..."}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">{formatPrice(price)}</div>
          <div className={cn("text-sm font-medium", isPositive ? "text-green-400" : "text-red-400")}>
            {formatPercent(change)}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Prev close: {formatPrice(prevClose)}
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
            {/* IntradayResponse is IntradayLine[] — access .length directly */}
            {Array.isArray(intraday)
              ? `${intraday.length} data points loaded`
              : "Loading chart data..."}
          </p>
        </div>

        {/* Auto-generated summary */}
        <div className="mt-4 p-3 rounded-lg bg-zinc-800/50">
          <p className="text-sm text-zinc-300">
            {quote
              ? `${symbol} is currently at ${formatPrice(price)}, ${isPositive ? "up" : "down"} ${formatPercent(Math.abs(change))} from yesterday's close of ${formatPrice(prevClose)}.`
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
            // SDK volume is a number, not a string
            value={quote?.volume ? `${(quote.volume / 1_000_000).toFixed(1)}M` : "--"}
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
            value={quote
              ? `${formatPrice(parseFloat(quote.low))} – ${formatPrice(parseFloat(quote.high))}`
              : "--"}
            sentiment="neutral"
            explanation="The lowest and highest prices the stock has traded at today."
          />
          <SignalCard
            title="Market Cap"
            // Computed from totalShares × lastDone since staticInfo has no market_cap
            value={marketCap ? formatMarketCapValue(marketCap) : "--"}
            sentiment="neutral"
            explanation="Total value of all the company's shares. Larger = more stable (usually)."
          />
        </div>
      </section>

      {/* Overview — uses only fields that exist in SecurityStaticInfo */}
      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Security Info</h2>

        {info ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-zinc-500">Exchange</div>
              <div className="text-sm font-medium text-white">{info.exchange || "--"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Currency</div>
              <div className="text-sm font-medium text-white">{info.currency || "--"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Lot Size</div>
              <div className="text-sm font-medium text-white">{info.lotSize ?? "--"}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">Total Shares</div>
              <div className="text-sm font-medium text-white">
                {info.totalShares ? `${(info.totalShares / 1e9).toFixed(2)}B` : "--"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">
                <TooltipTerm termKey="eps">EPS (TTM)</TooltipTerm>
              </div>
              <div className="text-sm font-medium text-white">
                {info.epsTtm ? `$${info.epsTtm}` : "--"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">BPS</div>
              <div className="text-sm font-medium text-white">
                {info.bps ? `$${info.bps}` : "--"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">
                <TooltipTerm termKey="dividendYield">Dividend / Share</TooltipTerm>
              </div>
              <div className="text-sm font-medium text-white">
                {info.dividendYield ? `$${info.dividendYield}` : "--"}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500">
                <TooltipTerm termKey="marketCap">Market Cap</TooltipTerm>
              </div>
              <div className="text-sm font-medium text-white">
                {marketCap ? formatMarketCapValue(marketCap) : "--"}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Loading security info...</p>
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
