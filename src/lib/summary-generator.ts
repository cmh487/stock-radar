// Plain-English summary generator for stock chart analysis

export interface DaySummaryData {
  symbol: string
  open: number
  prevClose: number
  high: number
  low: number
  current: number
  volumeRatio: number // vs 20-day average
  netFlow: "positive" | "negative" | "neutral"
  mainEvent?: string // e.g. "News: iPhone sales beat expectations"
}

export function generateDaySummary(data: DaySummaryData): string {
  const {
    symbol,
    open,
    prevClose,
    high,
    low,
    current,
    volumeRatio,
    netFlow,
    mainEvent,
  } = data

  // Gap description
  const gapPct = ((open - prevClose) / prevClose) * 100
  let gapDesc: string
  if (Math.abs(gapPct) < 0.1) gapDesc = "flat compared to yesterday"
  else if (gapPct > 0) gapDesc = `up ${gapPct.toFixed(1)}% from yesterday's close`
  else gapDesc = `down ${Math.abs(gapPct).toFixed(1)}% from yesterday's close`

  // Volume description
  let volDesc: string
  if (volumeRatio > 2) volDesc = `Volume is ${volumeRatio.toFixed(1)}x higher than normal — very active day.`
  else if (volumeRatio > 1.3) volDesc = `Volume is above average.`
  else if (volumeRatio < 0.5) volDesc = `Volume is unusually quiet today.`
  else volDesc = `Volume is normal.`

  // Flow description
  let flowDesc: string
  if (netFlow === "positive") flowDesc = "Net money flow is positive (more buying than selling)."
  else if (netFlow === "negative") flowDesc = "Net money flow is negative (more selling than buying)."
  else flowDesc = "Money flow is balanced."

  // Current position
  const range = high - low
  const position = range > 0 ? (current - low) / range : 0.5
  let posDesc: string
  if (position > 0.8) posDesc = "Currently trading near the day's high."
  else if (position < 0.2) posDesc = "Currently trading near the day's low."
  else posDesc = "Currently trading in the middle of today's range."

  let summary = `${symbol} opened at $${open.toFixed(2)}, ${gapDesc}. `
  if (mainEvent) summary += `${mainEvent}. `
  summary += `${volDesc} ${flowDesc} ${posDesc}`

  return summary
}

// Generate a multi-timeframe summary
export function generateTimeframeSummary(
  symbol: string,
  changePercent: number,
  period: string
): string {
  const direction = changePercent >= 0 ? "up" : "down"
  const absChange = Math.abs(changePercent).toFixed(1)

  const periodLabel: Record<string, string> = {
    "5d": "5 days",
    "1m": "1 month",
    "6m": "6 months",
    "1y": "1 year",
    "5y": "5 years",
  }

  return `${symbol} is ${direction} ${absChange}% over the past ${periodLabel[period] || period}.`
}
