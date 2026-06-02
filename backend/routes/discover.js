const { getMarketCtx } = require("../lb");

// Scoring algorithm for "Pick For Me"
function getScreenerConditions(risk, goal, budget) {
  const conditions = [];

  // Market cap by risk
  if (risk === "conservative") conditions.push({ key: "filter_marketcap", min: "500" });
  else if (risk === "moderate") conditions.push({ key: "filter_marketcap", min: "100" });
  else conditions.push({ key: "filter_marketcap", min: "20" });

  // PE by risk
  if (risk === "conservative") {
    conditions.push({ key: "filter_pettm", min: "10", max: "25" });
  } else if (risk === "moderate") {
    conditions.push({ key: "filter_pettm", min: "5", max: "35" });
  }

  // Goal-specific
  if (goal === "steady") {
    conditions.push({ key: "filter_roe", min: "15" });
    conditions.push({ key: "filter_salesgrowthyoy", min: "5", max: "20" });
  } else if (goal === "growth") {
    conditions.push({ key: "filter_salesgrowthyoy", min: "20" });
    conditions.push({ key: "filter_netincomegrowthyoy", min: "15" });
  } else if (goal === "dividends") {
    conditions.push({ key: "filter_divyld", min: "3" });
    conditions.push({ key: "filter_pettm", min: "5", max: "25" });
  }

  // Budget → price filter
  if (budget === "under50") conditions.push({ key: "filter_prevclose", max: "50" });
  else if (budget === "50to200") conditions.push({ key: "filter_prevclose", max: "200" });

  return conditions;
}

async function registerDiscoverRoutes(app) {
  // POST /api/discover/screen
  app.post("/api/discover/screen", async (req, res) => {
    try {
      const { risk, goal, budget } = req.body;

      if (!risk || !goal || !budget) {
        return res.status(400).json({ error: "Missing risk, goal, or budget" });
      }

      const conditions = getScreenerConditions(risk, goal, budget);
      const ctx = await getMarketCtx();

      const data = await ctx.screenerSearch({
        market: "US",
        conditions,
        sortByKey: "filter_marketcap",
        sortOrder: "desc",
        page: 0,
        size: 30,
      });

      res.json(data);
    } catch (err) {
      console.error("[discover/screen]", err.message);
      res.status(500).json({ error: "Screening failed" });
    }
  });

  // GET /api/discover/sectors
  app.get("/api/discover/sectors", async (req, res) => {
    try {
      const ctx = await getMarketCtx();
      const data = await ctx.industryRank({ market: "US", indicator: "0" });
      res.json(data);
    } catch (err) {
      console.error("[discover/sectors]", err.message);
      res.status(500).json({ error: "Failed to fetch sectors" });
    }
  });
}

module.exports = { registerDiscoverRoutes };
