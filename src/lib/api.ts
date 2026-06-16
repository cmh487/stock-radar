/**
 * Drop-in replacement for `fetch` that injects the Authorization header.
 * Uses NEXT_PUBLIC_API_SECRET so it works in both client and server components.
 */
export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const secret = process.env.NEXT_PUBLIC_API_SECRET
  return fetch(input, {
    ...init,
    headers: {
      ...(secret ? { Authorization: `Bearer ${secret}` } : {}),
      ...init?.headers,
    },
  })
}
