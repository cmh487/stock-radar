const { getQuoteCtx } = require("../lb");

async function registerWatchlistRoutes(app) {
  // GET /api/watchlist
  app.get("/api/watchlist", async (req, res) => {
    try {
      const ctx = await getQuoteCtx();
      const data = await ctx.watchlist();
      res.json(data);
    } catch (err) {
      console.error("[watchlist GET]", err.message);
      res.status(500).json({ error: "Failed to fetch watchlist" });
    }
  });

  // POST /api/watchlist
  app.post("/api/watchlist", async (req, res) => {
    try {
      const { name, securities } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Missing group name" });
      }
      const ctx = await getQuoteCtx();
      const data = await ctx.createWatchlistGroup({ name, securities: securities || [] });
      res.json(data);
    } catch (err) {
      console.error("[watchlist POST]", err.message);
      res.status(500).json({ error: "Failed to create watchlist" });
    }
  });

  // PUT /api/watchlist/:id
  app.put("/api/watchlist/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, securities, mode } = req.body;
      const ctx = await getQuoteCtx();
      const data = await ctx.updateWatchlistGroup({ id, name, securities, mode: mode || "replace" });
      res.json(data);
    } catch (err) {
      console.error("[watchlist PUT]", err.message);
      res.status(500).json({ error: "Failed to update watchlist" });
    }
  });

  // DELETE /api/watchlist/:id
  app.delete("/api/watchlist/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ctx = await getQuoteCtx();
      const data = await ctx.deleteWatchlistGroup({ id, purge: false });
      res.json(data);
    } catch (err) {
      console.error("[watchlist DELETE]", err.message);
      res.status(500).json({ error: "Failed to delete watchlist" });
    }
  });
}

module.exports = { registerWatchlistRoutes };
