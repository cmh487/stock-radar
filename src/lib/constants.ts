// Financial terms glossary for beginners

export interface GlossaryEntry {
  term: string
  short: string
  long: string
}

export const glossary: Record<string, GlossaryEntry> = {
  pe: {
    term: "P/E Ratio",
    short: "Price vs earnings — lower may mean cheaper stock",
    long: "The Price-to-Earnings ratio compares a stock's price to its earnings per share. A PE of 20 means you pay $20 for every $1 the company earns annually. Lower PE can indicate a cheaper stock, but very low PE might mean trouble.",
  },
  pb: {
    term: "P/B Ratio",
    short: "Price vs book value of assets",
    long: "Price-to-Book ratio compares market price to the company's net asset value. Below 1 means the stock trades below the value of its assets. Common for banks and industrial companies.",
  },
  roe: {
    term: "ROE",
    short: "How well a company uses investor money to generate profit",
    long: "Return on Equity measures how much profit a company generates for each dollar of shareholder equity. Higher ROE (>15%) generally indicates efficient management.",
  },
  marketCap: {
    term: "Market Cap",
    short: "Total value of all company shares",
    long: "Market capitalization = share price × total shares outstanding. Large cap (>$10B) are usually more stable. Small cap (<$2B) are riskier but may grow faster.",
  },
  volume: {
    term: "Volume",
    short: "Number of shares traded today",
    long: "Trading volume shows how many shares changed hands. High volume means high interest. Low volume can mean harder to buy/sell at your desired price.",
  },
  volumeRatio: {
    term: "Volume Ratio",
    short: "Today's activity vs normal",
    long: "Compares today's volume to the average. 2x means twice as active as usual — often happens around news events or earnings.",
  },
  dividendYield: {
    term: "Dividend Yield",
    short: "Annual cash payments as % of stock price",
    long: "If a $100 stock pays $3/year in dividends, yield is 3%. Higher yield means more passive income, but extremely high yields (>8%) can signal trouble.",
  },
  shortInterest: {
    term: "Short Interest",
    short: "% of shares bet against by traders",
    long: "When traders 'short' a stock, they profit if it falls. High short interest (>10%) means many expect the price to drop. Can also trigger a 'short squeeze' if the stock rises.",
  },
  putCallRatio: {
    term: "Put/Call Ratio",
    short: "Options market sentiment indicator",
    long: "Compares bearish bets (puts) to bullish bets (calls). Above 1 = more bearish. Below 0.7 = more bullish. Extreme readings can signal reversals.",
  },
  eps: {
    term: "EPS",
    short: "Profit per share",
    long: "Earnings Per Share = net income / shares outstanding. Shows how much profit each share represents. Growing EPS is a good sign.",
  },
  capitalFlow: {
    term: "Capital Flow",
    short: "Big money moving in or out",
    long: "Tracks whether large orders (institutional investors) are buying or selling. Net positive flow suggests big players are accumulating the stock.",
  },
}
