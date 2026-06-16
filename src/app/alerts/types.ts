export type AlertCondition = "price_rise" | "price_fall" | "percent_rise" | "percent_fall"
export type AlertFrequency = "once" | "always"

export interface AlertIndicator {
  id: string
  condition: AlertCondition
  price: string
  enabled: boolean
}

export interface AlertGroup {
  counter_id: string
  indicators: AlertIndicator[]
}

export interface AlertListResponse {
  lists: AlertGroup[]
}

export interface CreateAlertRequest {
  symbol: string
  condition: AlertCondition
  price: string
  frequency: AlertFrequency
}
