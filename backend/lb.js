const { Config, QuoteContext, TradeContext, MarketContext, AlertContext, SubType, Period } = require("longbridge");

let config = null;
let quoteCtx = null;
let tradeCtx = null;
let marketCtx = null;
let alertCtx = null;

function getConfig() {
  if (!config) {
    config = Config.fromApikey(
      process.env.LONGBRIDGE_APP_KEY,
      process.env.LONGBRIDGE_APP_SECRET,
      process.env.LONGBRIDGE_ACCESS_TOKEN,
    );
  }
  console.log("🚀Harrison ~ getConfig ~ config:", config,  process.env.LONGBRIDGE_APP_KEY,
      process.env.LONGBRIDGE_APP_SECRET,
      process.env.LONGBRIDGE_ACCESS_TOKEN,);
  return config;
}

async function getQuoteCtx() {
  if (!quoteCtx) {
    quoteCtx = await QuoteContext.new(getConfig());
  }
  return quoteCtx;
}

async function getTradeCtx() {
  if (!tradeCtx) {
    tradeCtx = await TradeContext.new(getConfig());
  }
  return tradeCtx;
}

function getMarketCtx() {
  if (!marketCtx) {
    marketCtx = MarketContext.new(getConfig());
  }
  return marketCtx;
}

async function getAlertCtx() {
  if (!alertCtx) {
    alertCtx = await AlertContext.new(getConfig());
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
