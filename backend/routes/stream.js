const { getQuoteCtx, SubType } = require("../lb");

async function registerStreamRoutes(app) {
  // GET /api/stream?symbols=AAPL.US,TSLA.US
  // Server-Sent Events for real-time quote push
  app.get("/api/stream", async (req, res) => {
    const symbolsParam = req.query.symbols;
    if (!symbolsParam) {
      return res.status(400).json({ error: "Missing symbols parameter" });
    }

    const symbols = symbolsParam.split(",").filter(Boolean);
    if (symbols.length === 0) {
      return res.status(400).json({ error: "No valid symbols" });
    }

    // SSE headers
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    // Send initial connection event
    res.write(`data: ${JSON.stringify({ type: "connected", symbols })}\n\n`);

    let ctx;
    try {
      ctx = await getQuoteCtx();

      // Set up quote push handler
      const handler = (_, event) => {
        try {
          const data = {
            type: "quote",
            symbol: event.symbol,
            lastDone: event.lastDone?.toString(),
            open: event.open?.toString(),
            high: event.high?.toString(),
            low: event.low?.toString(),
            volume: event.volume?.toString(),
            turnover: event.turnover?.toString(),
            timestamp: event.timestamp?.toString(),
          };
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          // Client disconnected
        }
      };

      ctx.setOnQuote(handler);
      await ctx.subscribe(symbols, [SubType.Quote]);

      // Heartbeat every 30s
      const heartbeat = setInterval(() => {
        try {
          res.write(`: heartbeat\n\n`);
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on client disconnect
      req.on("close", async () => {
        clearInterval(heartbeat);
        try {
          await ctx.unsubscribe(symbols, [SubType.Quote]);
        } catch (e) {
          // ignore
        }
      });
    } catch (err) {
      console.error("[stream]", err.message);
      res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
      res.end();
    }
  });
}

module.exports = { registerStreamRoutes };
