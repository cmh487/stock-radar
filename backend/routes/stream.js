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
      ctx = getQuoteCtx();

      // Set up quote push handler
      // PushQuoteEvent shape: { symbol: string, data: PushQuote }
      // PushQuote shape: { lastDone, open, high, low, volume, turnover, timestamp, ... }
      const handler = (_, event) => {
        try {
          const q = event.data; // PushQuote object
          const lastDone = q.lastDone?.toString();
          const prevClose = parseFloat(lastDone || "0");
          const data = {
            type: "quote",
            symbol: event.symbol,
            lastDone,
            open: q.open?.toString(),
            high: q.high?.toString(),
            low: q.low?.toString(),
            volume: q.volume?.toString(),
            turnover: q.turnover?.toString(),
            timestamp: q.timestamp?.toISOString?.() || q.timestamp?.toString(),
          };
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          // Client disconnected
        }
      };

      ctx.setOnQuote(handler);
      await ctx.subscribe(symbols, [SubType.Quote]);
      // const subscriptions = await ctx.subscriptions();
      // if (subscriptions) {
      //   res.write(`subscriptions: ${JSON.stringify(subscriptions)}\n\n`);
      // }

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
