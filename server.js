/**
 * Monitor 110 — Backend API
 * Node.js server: stock data (StockData.org), market/stock news (Stock News API), alerts engine.
 * Frontend is separate (index.html, script.js, styles.css) — no changes to frontend.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// API keys from environment (see .env.example)
const STOCKDATA_API_KEY = process.env.STOCKDATA_API_KEY || '';
const STOCKNEWS_API_KEY = process.env.STOCKNEWS_API_KEY || '';

// In-memory store for alerts (symbol, condition, targetPrice). Frontend can sync via POST/GET.
const alerts = [];
const triggeredAlerts = []; // recent "price target hit" events for polling

app.use(cors());
app.use(express.json());

// Optional: serve frontend static files so one origin works
app.use(express.static(path.join(__dirname)));

// ——— 1) Stock data API (StockData.org quote) ———
// GET /api/quote?symbol=AAPL
app.get('/api/quote', async (req, res) => {
  const symbol = (req.query.symbol || '').trim().toUpperCase();
  if (!symbol) {
    return res.status(400).json({ error: 'Missing symbol' });
  }
  if (!STOCKDATA_API_KEY) {
    return res.status(503).json({ error: 'StockData API key not configured. Set STOCKDATA_API_KEY in .env' });
  }
  try {
    const url = `https://www.StockData.org/api/v1/quote?symbol=${encodeURIComponent(symbol)}&api_key=${STOCKDATA_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error('Quote error:', err.message);
    res.status(500).json({ error: 'Failed to fetch quote', message: err.message });
  }
});

// ——— 2) Market news API ———
// Using StockData.org quote for "market" snapshot; for news feed we use Stock News API with broad tickers.
// GET /api/market-news?items=20
app.get('/api/market-news', async (req, res) => {
  const items = Math.min(parseInt(req.query.items, 10) || 20, 50);
  if (!STOCKNEWS_API_KEY) {
    return res.status(503).json({ error: 'Stock News API key not configured. Set STOCKNEWS_API_KEY in .env' });
  }
  try {
    // Market-wide: use common indices/tickers to get general market news
    const url = `https://stocknewsapi.com/api/v1?tickers=SPY,QQQ,DIA&items=${items}&token=${STOCKNEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error('Market news error:', err.message);
    res.status(500).json({ error: 'Failed to fetch market news', message: err.message });
  }
});

// ——— 3) Stock news API (Stock News API by tickers) ———
// GET /api/stock-news?tickers=AAPL&items=20
app.get('/api/stock-news', async (req, res) => {
  const tickers = (req.query.tickers || req.query.symbol || 'AAPL').trim().toUpperCase();
  const items = Math.min(parseInt(req.query.items, 10) || 20, 50);
  if (!STOCKNEWS_API_KEY) {
    return res.status(503).json({ error: 'Stock News API key not configured. Set STOCKNEWS_API_KEY in .env' });
  }
  try {
    const url = `https://stocknewsapi.com/api/v1?tickers=${encodeURIComponent(tickers)}&items=${items}&token=${STOCKNEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    res.json(data);
  } catch (err) {
    console.error('Stock news error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stock news', message: err.message });
  }
});

// ——— Alerts: CRUD (so backend can run the engine) ———
// GET /api/alerts — list all alerts
app.get('/api/alerts', (req, res) => {
  res.json({ alerts });
});

// POST /api/alerts — add alert { symbol, condition: 'above'|'below', targetPrice }
app.post('/api/alerts', (req, res) => {
  const { symbol, condition, targetPrice } = req.body || {};
  const sym = (symbol || '').trim().toUpperCase();
  const price = parseFloat(targetPrice);
  if (!sym || isNaN(price) || !['above', 'below'].includes(condition)) {
    return res.status(400).json({ error: 'Invalid body. Need symbol, condition (above|below), targetPrice' });
  }
  const id = Date.now();
  alerts.push({ id, symbol: sym, condition, targetPrice: price });
  res.status(201).json({ id, symbol: sym, condition, targetPrice: price });
});

// DELETE /api/alerts/:id
app.delete('/api/alerts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = alerts.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Alert not found' });
  alerts.splice(idx, 1);
  res.status(204).send();
});

// GET /api/alerts/triggered — recent “price target hit” events (frontend can poll)
app.get('/api/alerts/triggered', (req, res) => {
  res.json({ triggered: triggeredAlerts });
});

// ——— 4) Alerts engine: check prices every 60s ———
const ALERT_CHECK_INTERVAL_MS = 60000;

async function checkAlerts() {
  if (!STOCKDATA_API_KEY || alerts.length === 0) return;
  for (const alert of alerts) {
    try {
      const url = `https://www.StockData.org/api/v1/quote?symbol=${encodeURIComponent(alert.symbol)}&api_key=${STOCKDATA_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const price = data?.price ?? data?.close ?? data?.c;
      if (price == null) continue;
      const hit =
        alert.condition === 'above' ? price > alert.targetPrice : price < alert.targetPrice;
      if (hit) {
        const msg = `${alert.symbol} price target hit! Current: ${price}, target ${alert.condition} ${alert.targetPrice}`;
        console.log('Alert:', msg);
        triggeredAlerts.unshift({
          id: Date.now(),
          symbol: alert.symbol,
          condition: alert.condition,
          targetPrice: alert.targetPrice,
          currentPrice: price,
          message: msg
        });
        if (triggeredAlerts.length > 100) triggeredAlerts.pop();
      }
    } catch (e) {
      console.error('Alert check failed for', alert.symbol, e.message);
    }
  }
}

let alertsInterval;
function startAlertsEngine() {
  if (alertsInterval) clearInterval(alertsInterval);
  alertsInterval = setInterval(checkAlerts, ALERT_CHECK_INTERVAL_MS);
  checkAlerts(); // run once on start
}

startAlertsEngine();

// ——— Start server ———
app.listen(PORT, () => {
  console.log('Monitor 110 backend running at http://localhost:' + PORT);
  console.log('  GET  /api/quote?symbol=AAPL');
  console.log('  GET  /api/market-news?items=20');
  console.log('  GET  /api/stock-news?tickers=AAPL&items=20');
  console.log('  GET  /api/alerts  |  POST/DELETE /api/alerts  |  GET /api/alerts/triggered');
});
