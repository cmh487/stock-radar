export interface MarketTemperatureResponse {
  temperature: number
  description: string
}

export interface MoverStock {
  symbol: string
  name: string
  last_done: string
  change: string
}

export interface MoverEvent {
  stock: MoverStock
  alert_reason?: string
}

export interface MoversResponse {
  events: MoverEvent[]
}

export interface HotStockItem {
  symbol: string
  name: string
  lastDone: string
  chg: string
}

export interface HotStocksResponse {
  lists: HotStockItem[]
}
