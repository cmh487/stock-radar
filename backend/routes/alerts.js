const { getAlertCtx } = require("../lb");

async function registerAlertRoutes(app) {
  // GET /api/alerts
  app.get("/api/alerts", async (req, res) => {
    try {
      const ctx = await getAlertCtx();
      const data = await ctx.alertList();
      res.json(data);
    } catch (err) {
      console.error("[alerts GET]", err.message);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // POST /api/alerts
  app.post("/api/alerts", async (req, res) => {
    try {
      const { symbol, condition, price, frequency } = req.body;
      if (!symbol || !condition || !price) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const ctx = await getAlertCtx();
      const data = await ctx.alertAdd({
        symbol,
        condition,
        price,
        frequency: frequency || "once",
      });
      res.json(data);
    } catch (err) {
      console.error("[alerts POST]", err.message);
      res.status(500).json({ error: "Failed to create alert" });
    }
  });

  // DELETE /api/alerts/:id
  app.delete("/api/alerts/:id", async (req, res) => {
    try {
      const ctx = await getAlertCtx();
      const data = await ctx.alertDelete(req.params.id);
      res.json(data);
    } catch (err) {
      console.error("[alerts DELETE]", err.message);
      res.status(500).json({ error: "Failed to delete alert" });
    }
  });

  // PUT /api/alerts/:id/enable
  app.put("/api/alerts/:id/enable", async (req, res) => {
    try {
      const ctx = await getAlertCtx();
      const data = await ctx.alertEnable(req.params.id);
      res.json(data);
    } catch (err) {
      console.error("[alerts enable]", err.message);
      res.status(500).json({ error: "Failed to enable alert" });
    }
  });

  // PUT /api/alerts/:id/disable
  app.put("/api/alerts/:id/disable", async (req, res) => {
    try {
      const ctx = await getAlertCtx();
      const data = await ctx.alertDisable(req.params.id);
      res.json(data);
    } catch (err) {
      console.error("[alerts disable]", err.message);
      res.status(500).json({ error: "Failed to disable alert" });
    }
  });
}

module.exports = { registerAlertRoutes };
