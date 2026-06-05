"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export interface RealtimeQuote {
  symbol: string
  lastDone?: string
  open?: string
  high?: string
  low?: string
  volume?: string
  turnover?: string
  timestamp?: string
}

/**
 * Hook for real-time quote updates via Server-Sent Events.
 * Connects to /api/market/stream and receives live price pushes.
 */
export function useRealtimeQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, RealtimeQuote>>({})
  const [connected, setConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (!symbols.length) return

    const url = `/api/stream?symbols=${symbols.join(",")}`
    const es = new EventSource(url)

    es.onopen = () => setConnected(true)

    es.onmessage = (event) => {
      try {
        const data: RealtimeQuote = JSON.parse(event.data)
        if (data.symbol) {
          setQuotes((prev) => ({ ...prev, [data.symbol]: data }))
        }
      } catch {
        // ignore parse errors (heartbeats, etc.)
      }
    }

    es.onerror = () => {
      setConnected(false)
      es.close()
      // Reconnect after 5s
      setTimeout(connect, 50000)
    }

    eventSourceRef.current = es
  }, [symbols])

  useEffect(() => {
    connect()
    return () => {
      eventSourceRef.current?.close()
      eventSourceRef.current = null
    }
  }, [connect])

  return { quotes, connected }
}
