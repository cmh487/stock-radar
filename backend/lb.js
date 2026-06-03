const { Config, QuoteContext, TradeContext, MarketContext, AlertContext, SubType, Period } = require("longbridge");
const HttpsProxyAgent = require("https-proxy-agent");

// Corporate proxy support (local dev)
const proxyUrl = process.env.https_proxy || process.env.http_proxy;
const proxyAgent = proxyUrl ? new HttpsProxyAgent(proxyUrl) : undefined;

if (proxyAgent) {
  console.log(`[proxy] Using corporate proxy: ${proxyUrl}`);
}

let config = null;
let quoteCtx = null;
let tradeCtx = null;
let marketCtx = null;
let alertCtx = null;

function getConfig() {
  if (!config) {
    config = Config.fromApikeyEnv();

    // If proxy is configured, set the HTTP agent on the config
    // The Longbridge SDK respects the https_proxy / http_proxy env vars
    // for its HTTP calls. For WebSocket, we set it via global agent below.
    if (proxyAgent) {
      // Set global agent so all outbound HTTPS connections use the proxy
      const https = require("https");
      const http = require("http");
      https.globalAgent = proxyAgent;
      http.globalAgent = proxyAgent;
    }
  }
  return config;
}

function getQuoteCtx() {
  if (!quoteCtx) {
    quoteCtx = QuoteContext.new(getConfig());
  }
  return quoteCtx;
}

function getTradeCtx() {
  if (!tradeCtx) {
    tradeCtx = TradeContext.new(getConfig());
  }
  return tradeCtx;
}

function getMarketCtx() {
  if (!marketCtx) {
    marketCtx = MarketContext.new(getConfig());
  }
  return marketCtx;
}

function getAlertCtx() {
  if (!alertCtx) {
    alertCtx = AlertContext.new(getConfig());
  }
  return alertCtx;
}

module.exports = {
  getQuoteCtx,
  getTradeCtx,
  getMarketCtx,
  getAlertCtx,
  SubType,
  Period,
};
