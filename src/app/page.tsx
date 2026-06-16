"use client";

import { StockCard } from "@/components/cards/stock-card";
import { TemperatureGauge } from "@/components/cards/temperature-gauge";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useRealtimeQuotes } from "@/hooks/useRealtimeQuotes";
import { useMemo } from "react";
import type { HotStocksResponse, MarketTemperatureResponse, MoversResponse } from "./types";

export default function Dashboard() {
  const { data: temperature } = useApiQuery<MarketTemperatureResponse>(
    ["market-temperature"],
    "/api/market/temperature",
  );
  const { data: movers } = useApiQuery<MoversResponse>(["market-movers"], "/api/market/movers");
  const { data: hot } = useApiQuery<HotStocksResponse>(["market-hot"], "/api/market/hot?size=10");

  // Collect all symbols for real-time subscription
  const allSymbols = useMemo(() => {
    const symbols: string[] = [];
    movers?.events?.forEach((e) => e.stock?.symbol && symbols.push(e.stock.symbol));
    hot?.lists?.forEach((e) => e.symbol && symbols.push(e.symbol));
    return [...new Set(symbols)];
  }, [movers, hot]);

  const { quotes, connected } = useRealtimeQuotes(allSymbols);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Market Temperature */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TemperatureGauge value={temperature?.temperature ?? 50} />
        <div className="md:col-span-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-zinc-400">Market Summary</h2>
            <span
              className={`text-xs px-2 py-0.5 rounded ${connected ? "bg-green-900 text-green-300" : "bg-zinc-800 text-zinc-500"}`}
            >
              {connected ? "Live" : "Connecting..."}
            </span>
          </div>
          <p className="text-sm text-zinc-300">{temperature?.description || "Loading market sentiment..."}</p>
        </div>
      </section>

      {/* Top Movers */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Top Movers Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {movers?.events?.slice(0, 6).map((item) => {
            const sym = item.stock?.symbol || "";
            const live = quotes[sym];
            const lastDone = parseFloat(live?.lastDone || item.stock?.lastDone || "0");
            const prevClose = parseFloat(item.stock?.prevClose || "0");
            const changePercent = prevClose !== 0 ? ((lastDone - prevClose) / prevClose) * 100 : 0;
            return (
              <StockCard
                key={sym}
                symbol={sym}
                name={item.stock?.name || ""}
                price={lastDone}
                changePercent={changePercent}
                reason={item.alert_reason || item.alertReason}
              />
            );
          }) || <div className="col-span-3 text-sm text-zinc-500">Loading movers...</div>}
        </div>
      </section>

      {/* Hot Stocks */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Trending Stocks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {hot?.lists?.slice(0, 9).map((item) => {
            const sym = item.symbol || "";
            const live = quotes[sym];
            const lastDone = parseFloat(live?.lastDone || item.lastDone || "0");
            // chg is a decimal ratio from the rank API e.g. "0.018" = +1.8%
            const changePercent = parseFloat(item.chg || "0") * 100;
            return (
              <StockCard
                key={sym}
                symbol={sym}
                name={item.name || ""}
                price={lastDone}
                changePercent={changePercent}
                compact
              />
            );
          }) || <div className="col-span-3 text-sm text-zinc-500">Loading trending...</div>}
        </div>
      </section>
    </div>
  );
}
