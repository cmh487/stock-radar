"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { StockCard } from "@/components/cards/stock-card"
import { cn } from "@/lib/utils"

type RiskLevel = "conservative" | "moderate" | "aggressive"
type Goal = "steady" | "growth" | "dividends"
type Budget = "under50" | "50to200" | "nolimit"

const tabs = ["Pick For Me", "Trending", "Sectors"] as const
type Tab = (typeof tabs)[number]

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Pick For Me")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discover Stocks</h1>

      {/* Tab navigation */}
      <div className="flex gap-1 bg-zinc-900 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Pick For Me" && <PickForMe />}
      {activeTab === "Trending" && <Trending />}
      {activeTab === "Sectors" && <Sectors />}
    </div>
  )
}

function PickForMe() {
  const [step, setStep] = useState(0)
  const [risk, setRisk] = useState<RiskLevel | null>(null)
  const [goal, setGoal] = useState<Goal | null>(null)
  const [budget, setBudget] = useState<Budget | null>(null)

  const { data: results, isLoading, refetch } = useQuery({
    queryKey: ["pick-for-me", risk, goal, budget],
    queryFn: () =>
      fetch("/api/discover/screen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ risk, goal, budget }),
      }).then((r) => r.json()),
    enabled: false,
  })

  const handleSubmit = () => {
    if (risk && goal && budget) refetch()
  }

  const riskOptions = [
    { value: "conservative" as const, label: "Play it safe", desc: "Large, stable companies" },
    { value: "moderate" as const, label: "Balanced", desc: "Mix of stability and growth" },
    { value: "aggressive" as const, label: "I can handle swings", desc: "Higher risk, higher potential" },
  ]

  const goalOptions = [
    { value: "steady" as const, label: "Grow steadily", desc: "Consistent, reliable growth" },
    { value: "growth" as const, label: "Maximum growth", desc: "Fast-growing companies" },
    { value: "dividends" as const, label: "Cash payments", desc: "Regular dividend income" },
  ]

  const budgetOptions = [
    { value: "under50" as const, label: "Under $50", desc: "Per share" },
    { value: "50to200" as const, label: "$50 - $200", desc: "Per share" },
    { value: "nolimit" as const, label: "No limit", desc: "Any price" },
  ]

  return (
    <div className="space-y-6">
      {/* Step 1: Risk */}
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-2">1. How much risk are you comfortable with?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {riskOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setRisk(opt.value); setStep(Math.max(step, 1)) }}
              className={cn(
                "p-4 rounded-lg border text-left transition-colors",
                risk === opt.value
                  ? "border-blue-500 bg-blue-950/30"
                  : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
              )}
            >
              <div className="font-medium text-white text-sm">{opt.label}</div>
              <div className="text-xs text-zinc-400 mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Goal */}
      {step >= 1 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">2. What&apos;s your goal?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {goalOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setGoal(opt.value); setStep(Math.max(step, 2)) }}
                className={cn(
                  "p-4 rounded-lg border text-left transition-colors",
                  goal === opt.value
                    ? "border-blue-500 bg-blue-950/30"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                )}
              >
                <div className="font-medium text-white text-sm">{opt.label}</div>
                <div className="text-xs text-zinc-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Budget */}
      {step >= 2 && (
        <div>
          <h3 className="text-sm font-medium text-zinc-400 mb-2">3. Budget per stock?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {budgetOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { setBudget(opt.value); setStep(3) }}
                className={cn(
                  "p-4 rounded-lg border text-left transition-colors",
                  budget === opt.value
                    ? "border-blue-500 bg-blue-950/30"
                    : "border-zinc-700 bg-zinc-900 hover:border-zinc-600"
                )}
              >
                <div className="font-medium text-white text-sm">{opt.label}</div>
                <div className="text-xs text-zinc-400 mt-1">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {step >= 3 && (
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-white transition-colors disabled:opacity-50"
        >
          {isLoading ? "Finding stocks..." : "Find Stocks For Me"}
        </button>
      )}

      {/* Results */}
      {results?.items && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Your Picks</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.items.map((item: any) => (
              <StockCard
                key={item.symbol}
                symbol={item.symbol}
                name={item.name}
                price={parseFloat(item.indicators?.find((i: any) => i.key === "prevclose")?.value || "0")}
                changePercent={parseFloat(item.indicators?.find((i: any) => i.key === "prevchg")?.value || "0")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Trending() {
  const { data } = useQuery({
    queryKey: ["trending"],
    queryFn: () => fetch("/api/market/hot?size=20").then((r) => r.json()),
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {data?.lists?.map((item: any) => (
        <StockCard
          key={item.symbol}
          symbol={item.symbol}
          name={item.name}
          price={parseFloat(item.last_done || "0")}
          changePercent={parseFloat(item.chg || "0") * 100}
        />
      ))}
    </div>
  )
}

function Sectors() {
  return (
    <div className="p-8 text-center text-zinc-500">
      <p>Sector exploration coming soon.</p>
      <p className="text-xs mt-2">Will show US industry sectors ranked by daily performance.</p>
    </div>
  )
}
