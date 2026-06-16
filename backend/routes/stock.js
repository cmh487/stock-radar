const { getQuoteCtx, Period, AdjustType, TradeSessions } = require("../lb");

async function registerStockRoutes(app) {
  // GET /api/stock/:symbol/quote
  app.get("/api/stock/:symbol/quote", async (req, res) => {
    try {
      const { symbol } = req.params;
      const ctx = await getQuoteCtx();
      const resp = await ctx.quote([symbol]);
      const raw = resp[0] || null;
      if (!raw) return res.json(null);

      // Compute changeRate since SDK SecurityQuote has no changeRate field
      // changeRate = (lastDone - prevClose) / prevClose
      const lastDone = parseFloat(raw.lastDone?.toString() || "0");
      const prevClose = parseFloat(raw.prevClose?.toString() || "0");
      const changeRate = prevClose !== 0 ? (lastDone - prevClose) / prevClose : 0;

      res.json({ ...raw.toJSON(), changeRate: changeRate.toString() });
    } catch (err) {
      console.error("[stock/quote]", err.message);
      res.status(500).json({ error: "Failed to fetch quote" });
    }
  });

  // GET /api/stock/:symbol/intraday
  app.get("/api/stock/:symbol/intraday", async (req, res) => {
    try {
      const { symbol } = req.params;
      const ctx = await getQuoteCtx();
      const data = await ctx.intraday(symbol, TradeSessions.Intraday);
      res.json(data);
    } catch (err) {
      console.error("[stock/intraday]", err.message);
      res.status(500).json({ error: "Failed to fetch intraday" });
    }
  });

  // GET /api/stock/:symbol/candles?period=day&count=30
  app.get("/api/stock/:symbol/candles", async (req, res) => {
    try {
      const { symbol } = req.params;
      const periodStr = req.query.period || "day";
      const count = parseInt(req.query.count) || 30;

      const periodMap = {
        "1m": Period.Min1,
        "5m": Period.Min5,
        "15m": Period.Min15,
        "30m": Period.Min30,
        "60m": Period.Min60,
        day: Period.Day,
        week: Period.Week,
        month: Period.Month,
        year: Period.Year,
      };

      const period = periodMap[periodStr] || Period.Day;
      const ctx = await getQuoteCtx();
      // SDK signature: candlesticks(symbol, period, count, adjustType, tradeSessions)
      const data = await ctx.candlesticks(
        symbol,
        period,
        count,
        AdjustType.ForwardAdjust,
        TradeSessions.Intraday
      );
      res.json(data);
    } catch (err) {
      console.error("[stock/candles]", err.message);
      res.status(500).json({ error: "Failed to fetch candlesticks" });
    }
  });

  // GET /api/stock/:symbol/info
  app.get("/api/stock/:symbol/info", async (req, res) => {
    try {
      const { symbol } = req.params;
      const ctx = await getQuoteCtx();
      const data = await ctx.staticInfo([symbol]);
      res.json(data[0] || null);
    } catch (err) {
      console.error("[stock/info]", err.message);
      res.status(500).json({ error: "Failed to fetch info" });
    }
  });

  // GET /api/stock/:symbol/depth
  app.get("/api/stock/:symbol/depth", async (req, res) => {
    try {
      const { symbol } = req.params;
      const ctx = await getQuoteCtx();
      const data = await ctx.depth(symbol);
      res.json(data);
    } catch (err) {
      console.error("[stock/depth]", err.message);
      res.status(500).json({ error: "Failed to fetch depth" });
    }
  });
}

module.exports = { registerStockRoutes };
