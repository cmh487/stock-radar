"use client"

import { fetchEventSource } from "@microsoft/fetch-event-source"
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
 * Connects to /api/stream and receives live price pushes.
 * Uses fetchEventSource instead of native EventSource to support Authorization header.
 */
export function useRealtimeQuotes(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, RealtimeQuote>>({})
  const [connected, setConnected] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const connect = useCallback(() => {
    if (!symbols.length) return

    abortControllerRef.current?.abort()
    const controller = new AbortController()
    abortControllerRef.current = controller

    const url = `/api/stream?symbols=${symbols.join(",")}`
    const secret = process.env.NEXT_PUBLIC_API_SECRET

    fetchEventSource(url, {
      headers: {
        ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      },
      signal: controller.signal,
      onopen: async () => {
        setConnected(true)
      },
      onmessage: (event) => {
        try {
          const data: RealtimeQuote = JSON.parse(event.data)
          if (data.symbol) {
            setQuotes((prev) => ({ ...prev, [data.symbol]: data }))
          }
        } catch {
          // ignore parse errors (heartbeats, etc.)
        }
      },
      onerror: () => {
        setConnected(false)
        // fetchEventSource retries automatically; throw to stop retrying
        throw new Error("SSE error")
      },
    }).catch(() => {
      setConnected(false)
      // Reconnect after 5s if not deliberately aborted
      if (!controller.signal.aborted) {
        setTimeout(connect, 5000)
      }
    })
  }, [symbols])

  useEffect(() => {
    // connect() // temp close
    return () => {
      abortControllerRef.current?.abort()
      abortControllerRef.current = null
    }
  }, [connect])

  return { quotes, connected }
}
