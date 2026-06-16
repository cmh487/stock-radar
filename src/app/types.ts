// SDK: MarketTemperature
// Fields: temperature (number), description (string), valuation (number), sentiment (number), timestamp (Date)
export interface MarketTemperatureResponse {
  temperature: number
  description: string
  valuation: number
  sentiment: number
  timestamp: string
}

// SDK: TopMovers event stock shape (from MCP/rank API — not a direct SDK type)
// Backend serialises via toJSON() so all Decimal fields become strings
export interface MoverStock {
  symbol: string
  name: string
  lastDone: string   // was last_done — SDK toJSON() is camelCase
  prevClose: string
  change: string     // this comes from MCP top_movers, not SDK directly
}

export interface MoverEvent {
  stock: MoverStock
  alertReason?: string  // camelCase from toJSON
  alert_reason?: string // MCP may still return snake_case
}

export interface MoversResponse {
  events: MoverEvent[]
}

// SDK: rank_list / hot stocks (from MCP RankList — not a direct SDK type)
export interface HotStockItem {
  symbol: string
  name: string
  lastDone: string  // camelCase
  chg: string       // decimal ratio e.g. "0.018" = +1.8%
}

export interface HotStocksResponse {
  lists: HotStockItem[]
}

// SDK: SecurityQuote.toJSON()
// Fields: symbol, lastDone (Decimal→string), prevClose (Decimal→string),
//         open, high, low, volume (number), turnover (Decimal→string),
//         tradeStatus, preMarketQuote, postMarketQuote, overnightQuote
// + computed by backend: changeRate (string)
export interface StockQuote {
  symbol: string
  lastDone: string
  prevClose: string
  open: string
  high: string
  low: string
  volume: number
  turnover: string
  tradeStatus: number
  changeRate: string  // computed by backend: (lastDone - prevClose) / prevClose
}

// SDK: IntradayLine.toJSON()
// Fields: price (Decimal→string), timestamp (Date→string), volume (number),
//         turnover (Decimal→string), avgPrice (Decimal→string)
export interface IntradayLine {
  price: string
  timestamp: string
  volume: number
  turnover: string
  avgPrice: string
}

// intraday() returns IntradayLine[] directly (array, not wrapped object)
export type IntradayResponse = IntradayLine[]

// SDK: SecurityStaticInfo.toJSON()
// Fields: symbol, nameCn, nameEn, nameHk, exchange, currency, lotSize,
//         totalShares, circulatingShares, hkShares, eps, epsTtm, bps,
//         dividendYield, stockDerivatives, board
// NOTE: No market_cap, description, pe, industry, employees in staticInfo
export interface StockInfo {
  symbol: string
  nameCn: string
  nameEn: string
  nameHk: string
  exchange: string
  currency: string
  lotSize: number
  totalShares: number
  circulatingShares: number
  hkShares: number
  eps: string
  epsTtm: string
  bps: string
  dividendYield: string  // per share dividend, NOT yield ratio
  stockDerivatives: number[]
  board: number
}

// SDK: WatchlistGroup.toJSON()
// Fields: id (number), name (string), securities (WatchlistSecurity[])
export interface WatchlistSecurity {
  symbol: string
  market: number
  name: string
  watchedPrice: string | null  // Decimal→string or null
  watchedAt: string
  isPinned: boolean
}

export interface WatchlistGroup {
  id: number
  name: string
  securities: WatchlistSecurity[]
}
