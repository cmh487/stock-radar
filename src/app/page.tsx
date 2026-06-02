"use client"

import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { TemperatureGauge } from "@/components/cards/temperature-gauge"
import { StockCard } from "@/components/cards/stock-card"
import { useRealtimeQuotes } from "@/hooks/useRealtimeQuotes"

export default function Dashboard() {
  const { data: temperature } = useQuery({
    queryKey: ["market-temperature"],
    queryFn: () => fetch("/api/market/temperature").then((r) => r.json()),
  })

  const { data: movers } = useQuery({
    queryKey: ["market-movers"],
    queryFn: () => fetch("/api/market/movers").then((r) => r.json()),
  })

  const { data: hot } = useQuery({
    queryKey: ["market-hot"],
    queryFn: () => fetch("/api/market/hot?size=10").then((r) => r.json()),
  })

  // Collect all symbols for real-time subscription
  const allSymbols = useMemo(() => {
    const symbols: string[] = []
    movers?.events?.forEach((e: any) => e.stock?.symbol && symbols.push(e.stock.symbol))
    hot?.lists?.forEach((e: any) => e.symbol && symbols.push(e.symbol))
    return [...new Set(symbols)]
  }, [movers, hot])

  const { quotes, connected } = useRealtimeQuotes(allSymbols)

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Market Temperature */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TemperatureGauge value={temperature?.temperature ?? 50} />
        <div className="md:col-span-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-zinc-400">Market Summary</h2>
            <span className={`text-xs px-2 py-0.5 rounded ${connected ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-500"}`}>
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
          <p className="text-sm text-zinc-300">
            {temperature?.description || "Loading market sentiment..."}
          </p>
        </div>
      </section>

      {/* Top Movers */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Top Movers Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {movers?.events?.slice(0, 6).map((item: any) => {
            const sym = item.stock?.symbol || ""
            const live = quotes[sym]
            return (
              <StockCard
                key={sym}
                symbol={sym}
                name={item.stock?.name || ""}
                price={parseFloat(live?.lastDone || item.stock?.last_done || "0")}
                changePercent={parseFloat(item.stock?.change || "0") * 100}
                reason={item.alert_reason}
              />
            )
          }) || (
            <div className="col-span-3 text-sm text-zinc-500">Loading movers...</div>
          )}
        </div>
      </section>

      {/* Hot Stocks */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Trending Stocks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hot?.lists?.slice(0, 9).map((item: any) => {
            const sym = item.symbol || ""
            const live = quotes[sym]
            return (
              <StockCard
                key={sym}
                symbol={sym}
                name={item.name || ""}
                price={parseFloat(live?.lastDone || item.last_done || "0")}
                changePercent={parseFloat(item.chg || "0") * 100}
                compact
              />
            )
          }) || (
            <div className="col-span-3 text-sm text-zinc-500">Loading trending...</div>
          )}
        </div>
      </section>
    </div>
  )
}
