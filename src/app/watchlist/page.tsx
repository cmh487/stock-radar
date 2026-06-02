"use client"

import { useQuery } from "@tanstack/react-query"
import { StockCard } from "@/components/cards/stock-card"
import { useState } from "react"

export default function WatchlistPage() {
  const [newGroupName, setNewGroupName] = useState("")

  const { data, refetch } = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => fetch("/api/watchlist").then((r) => r.json()),
  })

  const createGroup = async () => {
    if (!newGroupName.trim()) return
    await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName }),
    })
    setNewGroupName("")
    refetch()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Watchlist</h1>
      </div>

      {/* Create group */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="New group name..."
          className="px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
        />
        <button
          onClick={createGroup}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
        >
          Create Group
        </button>
      </div>

      {/* Groups */}
      {data?.groups?.map((group: any) => (
        <section key={group.id} className="space-y-3">
          <h2 className="text-lg font-semibold">{group.name}</h2>
          {group.securities?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.securities.map((sec: any) => (
                <StockCard
                  key={sec.symbol}
                  symbol={sec.symbol}
                  name={sec.name || sec.symbol}
                  price={parseFloat(sec.watched_price || "0")}
                  changePercent={0}
                  compact
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No stocks in this group yet. Search for stocks to add.</p>
          )}
        </section>
      )) || (
        <div className="text-center py-12">
          <p className="text-zinc-400">No watchlist groups yet.</p>
          <p className="text-xs text-zinc-500 mt-1">Create a group above to start tracking stocks.</p>
        </div>
      )}
    </div>
  )
}
