const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const { registerMarketRoutes } = require("./routes/market");
const { registerStockRoutes } = require("./routes/stock");
const { registerStreamRoutes } = require("./routes/stream");
const { registerDiscoverRoutes } = require("./routes/discover");
const { registerWatchlistRoutes } = require("./routes/watchlist");
const { registerAlertRoutes } = require("./routes/alerts");

const app = express();
const PORT = process.env.PORT || 4000;

// --- Middleware ---

// Security headers
app.use(helmet());

// CORS — allow only your Vercel frontend
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  process.env.FRONTEND_URL, // e.g. https://stock-radar.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Parse JSON bodies
app.use(express.json());

// --- Auth middleware ---
// Shared secret between Next.js and this backend
// Frontend sends: Authorization: Bearer <API_SECRET>
app.use("/api", (req, res, next) => {
  // Skip auth for health check
  if (req.path === "/health") return next();

  const secret = process.env.API_SECRET;
  if (!secret) {
    // No secret configured = no auth enforced (dev mode)
    return next();
  }

  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${secret}`) {
    return res.status(401).json({ error: "Unauthorized", auth ,secret});
  }
  next();
});

// --- Rate limiting (simple in-memory) ---
const rateLimits = new Map();
const RATE_LIMIT = 60; // per minute
const RATE_WINDOW = 60 * 1000;

app.use("/api", (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimits.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return next();
  }
  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({ error: "Too many requests" });
  }
  entry.count++;
  next();
});

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Register routes ---
registerMarketRoutes(app);
registerStockRoutes(app);
registerStreamRoutes(app);
registerDiscoverRoutes(app);
registerWatchlistRoutes(app);
registerAlertRoutes(app);

// --- Error handler ---
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.message);
  res.status(500).json({ error: "Internal server error" });
});

// --- Start ---
app.listen(PORT, () => {
  console.log(`StockRadar backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
