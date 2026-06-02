// Scoring algorithm for "Pick For Me" discovery mode

export type RiskLevel = "conservative" | "moderate" | "aggressive"
export type Goal = "steady" | "growth" | "dividends"
export type Budget = "under50" | "50to200" | "nolimit"

export interface ScreenerCondition {
  key: string
  min?: string
  max?: string
}

export interface ScoringWeights {
  analyst: number
  momentum: number
  valuation: number
  popularity: number
}

// Map user answers to screener filter conditions
export function getScreenerConditions(
  risk: RiskLevel,
  goal: Goal,
  budget: Budget
): ScreenerCondition[] {
  const conditions: ScreenerCondition[] = []

  // Market cap by risk
  if (risk === "conservative") conditions.push({ key: "marketcap", min: "500" }) // >$50B (unit: 亿)
  else if (risk === "moderate") conditions.push({ key: "marketcap", min: "100" }) // >$10B
  else conditions.push({ key: "marketcap", min: "20" }) // >$2B

  // PE by risk
  if (risk === "conservative") {
    conditions.push({ key: "pettm", min: "10", max: "25" })
  } else if (risk === "moderate") {
    conditions.push({ key: "pettm", min: "5", max: "35" })
  }
  // aggressive: no PE filter

  // Goal-specific
  if (goal === "steady") {
    conditions.push({ key: "roe", min: "15" })
    conditions.push({ key: "salesgrowthyoy", min: "5", max: "20" })
  } else if (goal === "growth") {
    conditions.push({ key: "salesgrowthyoy", min: "20" })
    conditions.push({ key: "netincomegrowthyoy", min: "15" })
  } else if (goal === "dividends") {
    conditions.push({ key: "divyld", min: "3" })
    conditions.push({ key: "pettm", min: "5", max: "25" })
  }

  // Budget → price filter
  if (budget === "under50") conditions.push({ key: "prevclose", max: "50" })
  else if (budget === "50to200") conditions.push({ key: "prevclose", max: "200" })

  return conditions
}

// Scoring weights by risk profile
export function getScoringWeights(risk: RiskLevel): ScoringWeights {
  switch (risk) {
    case "conservative":
      return { analyst: 0.35, momentum: 0.1, valuation: 0.35, popularity: 0.2 }
    case "moderate":
      return { analyst: 0.25, momentum: 0.25, valuation: 0.25, popularity: 0.25 }
    case "aggressive":
      return { analyst: 0.15, momentum: 0.35, valuation: 0.2, popularity: 0.3 }
  }
}

// Normalize a value to 0-1 range
function normalize(value: number, min: number, max: number): number {
  if (max === min) return 0.5
  return Math.max(0, Math.min(1, (value - min) / (max - min)))
}

export interface StockScore {
  symbol: string
  name: string
  score: number
  sector: string
  reason: string
}

// Score and rank stocks, enforce sector diversification (max 3 per sector)
export function rankAndDiversify(
  stocks: StockScore[],
  limit: number = 10,
  maxPerSector: number = 3
): StockScore[] {
  // Sort by score descending
  const sorted = [...stocks].sort((a, b) => b.score - a.score)

  const result: StockScore[] = []
  const sectorCount: Record<string, number> = {}

  for (const stock of sorted) {
    if (result.length >= limit) break
    const count = sectorCount[stock.sector] || 0
    if (count >= maxPerSector) continue
    result.push(stock)
    sectorCount[stock.sector] = count + 1
  }

  return result
}
