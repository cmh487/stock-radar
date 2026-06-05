const { getQuoteCtx, getMarketCtx } = require("../lb");
const { Market } = require("longbridge");
async function registerMarketRoutes(app) {
  // GET /api/market/temperature
  app.get("/api/market/temperature", async (req, res) => {
    try {
      const ctx = getQuoteCtx();
      const data = await ctx.marketTemperature(Market.US);
      res.json(data);
    } catch (err) {
      console.error("[market/temperature]", err.message);
      res.status(500).json({ error: "Failed to fetch market temperature" });
    }
  });

  // GET /api/market/movers
  app.get("/api/market/movers", async (req, res) => {
    try {
      const ctx = getMarketCtx();
      const data = await ctx.topMovers(["US"], 1, undefined, 10);
      res.json(data);
    } catch (err) {
      console.error("[market/movers]", err.message);
      res.status(500).json({ error: "Failed to fetch movers" });
    }
  });

  // GET /api/market/hot?size=10
  app.get("/api/market/hot", async (req, res) => {
    try {
      const ctx = await getMarketCtx();
      const data = await ctx.rankList('hot_all-us',true);
      res.json(data);
    } catch (err) {
      console.error("[market/hot]", err.message);
      res.status(500).json({ error: "Failed to fetch hot stocks" });
    }
  });

  // GET /api/market/status
  app.get("/api/market/status", async (req, res) => {
    try {
      const ctx = await getQuoteCtx();
      const data = await ctx.tradingSession();
      res.json(data);
    } catch (err) {
      console.error("[market/status]", err.message);
      res.status(500).json({ error: "Failed to fetch market status" });
    }
  });
}

module.exports = { registerMarketRoutes };
