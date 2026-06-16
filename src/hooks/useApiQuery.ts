"use client"

import { apiFetch } from "@/lib/api"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"

/**
 * Wrapper around `useQuery` for simple GET requests.
 * Automatically injects the Authorization header via `apiFetch`.
 *
 * Usage:
 *   const { data } = useApiQuery<Market>(["market", "hot"], "/api/market/hot?size=10")
 *
 * For non-GET or custom queryFn, use `useQuery` directly with `apiFetch`:
 *   queryFn: () => apiFetch("/api/discover/screen", { method: "POST", ... }).then(r => r.json())
 */
export function useApiQuery<TData = unknown>(
  queryKey: unknown[],
  url: string,
  options?: Omit<UseQueryOptions<TData>, "queryKey" | "queryFn">
) {
  return useQuery<TData>({
    queryKey,
    queryFn: () => apiFetch(url).then((r) => r.json()),
    ...options,
  })
}
