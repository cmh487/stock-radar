"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function AlertsPage() {
  const [symbol, setSymbol] = useState("")
  const [condition, setCondition] = useState("price_rise")
  const [price, setPrice] = useState("")

  const { data, refetch } = useQuery({
    queryKey: ["alerts"],
    queryFn: () => fetch("/api/alerts").then((r) => r.json()),
  })

  const createAlert = async () => {
    if (!symbol || !price) return
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol, condition, price, frequency: "once" }),
    })
    setSymbol("")
    setPrice("")
    refetch()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Price Alerts</h1>

      {/* Create alert form */}
      <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900 space-y-3">
        <h2 className="text-sm font-medium text-zinc-400">Add New Alert</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Symbol (e.g. AAPL.US)"
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-zinc-500"
          >
            <option value="price_rise">Price rises above</option>
            <option value="price_fall">Price falls below</option>
            <option value="percent_rise">% rises above</option>
            <option value="percent_fall">% falls below</option>
          </select>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price / %"
            className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
          />
          <button
            onClick={createAlert}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
          >
            Add Alert
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {data?.lists?.map((group: any) =>
          group.indicators?.map((alert: any) => (
            <div
              key={alert.id}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border",
                alert.enabled ? "border-zinc-700 bg-zinc-900" : "border-zinc-800 bg-zinc-900/50 opacity-60"
              )}
            >
              <div>
                <span className="text-sm font-medium text-white">{group.counter_id}</span>
                <span className="text-xs text-zinc-400 ml-2">
                  {alert.condition} @ {alert.price}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs px-2 py-0.5 rounded", alert.enabled ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-500")}>
                  {alert.enabled ? "Active" : "Disabled"}
                </span>
              </div>
            </div>
          ))
        ) || (
          <div className="text-center py-12">
            <p className="text-zinc-400">No alerts configured yet.</p>
            <p className="text-xs text-zinc-500 mt-1">Add an alert above to get notified of price changes.</p>
          </div>
        )}
      </div>
    </div>
  )
}
