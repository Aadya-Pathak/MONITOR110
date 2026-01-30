/**
 * Monitor 110 — Stock Market Dashboard
 * Features: Charts, Stock Screener, Watchlist, Price Alerts (HTML/CSS/JS only)
 */

(function () {
  'use strict';

  const STORAGE_WATCHLIST = 'monitor110_watchlist';
  const STORAGE_ALERTS = 'monitor110_alerts';
  const STORAGE_AI_EXECUTED = 'monitor110_ai_executed';

  // ——— Mock live signals (blogs, forums, news, discussions) ———
  const MOCK_SIGNALS = [
    { id: 1, source: 'news', sourceLabel: 'Reuters', time: '2m ago', headline: 'Apple supplier reports strong Q4 demand', snippet: 'Key supplier sees iPhone orders above prior estimates, signaling resilient consumer demand.', symbol: 'AAPL', sentiment: 'bullish' },
    { id: 2, source: 'forum', sourceLabel: 'r/stocks', time: '5m ago', headline: 'NVDA options flow: large call buying', snippet: 'Unusual call volume in weekly 500 strikes. Several blocks bought at ask.', symbol: 'NVDA', sentiment: 'bullish' },
    { id: 3, source: 'blog', sourceLabel: 'Seeking Alpha', time: '8m ago', headline: 'Tesla delivery estimates revised lower in Europe', snippet: 'Analysts trim Q1 delivery forecasts amid softer registration data in key markets.', symbol: 'TSLA', sentiment: 'bearish' },
    { id: 4, source: 'social', sourceLabel: 'Twitter / X', time: '12m ago', headline: 'Fed speaker: rates to stay higher for longer', snippet: 'Comments suggest two cuts in 2025, not three. Treasury yields tick up.', symbol: 'SPY', sentiment: 'bearish' },
    { id: 5, source: 'news', sourceLabel: 'Bloomberg', time: '15m ago', headline: 'Microsoft Azure growth accelerates', snippet: 'Cloud revenue beats Street. AI workloads driving incremental demand.', symbol: 'MSFT', sentiment: 'bullish' },
    { id: 6, source: 'forum', sourceLabel: 'StockTwits', time: '18m ago', headline: 'BTC accumulation by large wallets', snippet: 'On-chain: whale addresses adding. Exchange reserves declining.', symbol: 'BTCUSD', sentiment: 'bullish' },
    { id: 7, source: 'blog', sourceLabel: 'Barron\'s', time: '22m ago', headline: 'JPMorgan upgrades big banks on NII outlook', snippet: 'Net interest income seen stable; upgrade JPM, BAC to Overweight.', symbol: 'JPM', sentiment: 'bullish' },
    { id: 8, source: 'social', sourceLabel: 'Reddit', time: '25m ago', headline: 'META ad spend trends improving', snippet: 'Advertisers reporting better ROAS in Q1. Reels monetization ramping.', symbol: 'META', sentiment: 'neutral' },
    { id: 9, source: 'news', sourceLabel: 'CNBC', time: '30m ago', headline: 'Amazon Prime fee increase under discussion', snippet: 'Potential price hike could boost revenue; margin impact mixed.', symbol: 'AMZN', sentiment: 'neutral' },
    { id: 10, source: 'forum', sourceLabel: 'Elite Trader', time: '35m ago', headline: 'ETH staking unlocks schedule', snippet: 'Upcoming unlock wave in March; some expect selling pressure.', symbol: 'ETHUSD', sentiment: 'bearish' },
  ];

  // ——— Mock AI recommendations (algorithm-based) ———
  const MOCK_AI_RECOMMENDATIONS = [
    { id: 'ai1', symbol: 'AAPL', action: 'BUY', confidence: 87, reasoning: 'Sentiment from news & forums bullish; momentum and volume support. Target 182.', price: 178.42 },
    { id: 'ai2', symbol: 'NVDA', action: 'BUY', confidence: 82, reasoning: 'Options flow and blog sentiment positive. Short-term momentum intact.', price: 495.80 },
    { id: 'ai3', symbol: 'TSLA', action: 'SELL', confidence: 71, reasoning: 'Delivery estimates revised lower; sentiment turning negative in EU data.', price: 248.50 },
    { id: 'ai4', symbol: 'MSFT', action: 'BUY', confidence: 90, reasoning: 'Azure beat and AI narrative. Strong institutional flow.', price: 378.91 },
    { id: 'ai5', symbol: 'META', action: 'HOLD', confidence: 65, reasoning: 'Mixed signals. Ad trends improving but valuation rich. Wait for pullback.', price: 485.20 },
    { id: 'ai6', symbol: 'BTCUSD', action: 'BUY', confidence: 78, reasoning: 'On-chain accumulation; exchange outflows. Sentiment from crypto forums bullish.', price: 43250 },
  ];

  // ——— Mock stock data for Screener ———
  const MOCK_STOCKS = [
    { symbol: 'AAPL', name: 'Apple Inc', sector: 'Technology', price: 178.42, change: 1.2, volume: '52.4M', marketCap: '2.78T' },
    { symbol: 'GOOGL', name: 'Alphabet Inc', sector: 'Technology', price: 141.85, change: 0.8, volume: '28.1M', marketCap: '1.78T' },
    { symbol: 'MSFT', name: 'Microsoft Corp', sector: 'Technology', price: 378.91, change: -0.3, volume: '22.3M', marketCap: '2.82T' },
    { symbol: 'AMZN', name: 'Amazon.com Inc', sector: 'Consumer', price: 178.25, change: 1.5, volume: '45.2M', marketCap: '1.85T' },
    { symbol: 'META', name: 'Meta Platforms', sector: 'Technology', price: 485.20, change: 2.1, volume: '18.9M', marketCap: '1.24T' },
    { symbol: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology', price: 495.80, change: -0.8, volume: '52.1M', marketCap: '1.22T' },
    { symbol: 'TSLA', name: 'Tesla Inc', sector: 'Consumer', price: 248.50, change: -1.2, volume: '98.3M', marketCap: '789B' },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', price: 195.40, change: 0.5, volume: '12.4M', marketCap: '567B' },
    { symbol: 'V', name: 'Visa Inc', sector: 'Finance', price: 278.90, change: 0.3, volume: '7.2M', marketCap: '568B' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', price: 158.20, change: -0.2, volume: '8.1M', marketCap: '382B' },
    { symbol: 'UNH', name: 'UnitedHealth', sector: 'Healthcare', price: 525.60, change: 1.8, volume: '3.2M', marketCap: '486B' },
    { symbol: 'XOM', name: 'Exxon Mobil', sector: 'Energy', price: 102.40, change: -0.5, volume: '18.5M', marketCap: '408B' },
    { symbol: 'BTCUSD', name: 'Bitcoin', sector: 'Technology', price: 43250, change: 2.1, volume: '1.2B', marketCap: '845B' },
    { symbol: 'ETHUSD', name: 'Ethereum', sector: 'Technology', price: 2285, change: -0.5, volume: '450M', marketCap: '275B' },
  ];

  // ——— Section switching ———
  const sections = document.querySelectorAll('.dashboard-section');
  const navLinks = document.querySelectorAll('.nav-link, .logo[data-section]');

  function showSection(sectionId) {
    sections.forEach(function (el) {
      el.classList.toggle('hidden', el.id !== 'section-' + sectionId);
    });
    navLinks.forEach(function (link) {
      const target = link.getAttribute('data-section');
      link.classList.toggle('active', target === sectionId);
    });
    if (sectionId === 'charts') {
      window.dispatchEvent(new Event('resize'));
    }
    if (sectionId === 'signals') renderSignals();
    if (sectionId === 'ai-trade') renderAIRecommendations();
    if (sectionId === 'screener') renderScreener();
    if (sectionId === 'watchlist') renderWatchlist();
    if (sectionId === 'alerts') renderAlerts();
  }

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const sectionId = link.getAttribute('data-section');
      if (sectionId) showSection(sectionId);
    });
  });

  // Set initial active nav (Signals is primary)
  document.querySelector('.nav-link[data-section="signals"]').classList.add('active');

  // ——— Header Search (ticker search) ———
  function doHeaderSearch() {
    const input = document.getElementById('symbolSearch');
    const symbol = (input && input.value ? input.value.trim() : '').toUpperCase();
    if (!symbol) return;
    showSection('charts');
    const currentSymbolEl = document.querySelector('.current-symbol');
    const currentPriceEl = document.querySelector('.current-price');
    const currentChangeEl = document.querySelector('.current-change');
    if (currentSymbolEl) currentSymbolEl.textContent = symbol;
    const stock = MOCK_STOCKS.find(function (s) { return s.symbol === symbol; });
    if (stock) {
      if (currentPriceEl) currentPriceEl.textContent = formatPrice(stock.price);
      if (currentChangeEl) {
        currentChangeEl.textContent = (stock.change >= 0 ? '+' : '') + stock.change + '%';
        currentChangeEl.className = 'current-change ' + (stock.change >= 0 ? 'up' : 'down');
      }
    } else {
      if (currentPriceEl) currentPriceEl.textContent = '—';
      if (currentChangeEl) {
        currentChangeEl.textContent = '—';
        currentChangeEl.className = 'current-change';
      }
    }
  }

  var headerSearchBtn = document.getElementById('headerSearchBtn');
  if (headerSearchBtn) headerSearchBtn.addEventListener('click', doHeaderSearch);
  var symbolSearchInput = document.getElementById('symbolSearch');
  if (symbolSearchInput) {
    symbolSearchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') doHeaderSearch();
    });
  }

  // ——— Live Signals Feed ———
  let signalsFiltered = MOCK_SIGNALS.slice();

  function filterSignals() {
    const source = document.getElementById('signalSourceFilter') && document.getElementById('signalSourceFilter').value;
    const sentiment = document.getElementById('signalSentimentFilter') && document.getElementById('signalSentimentFilter').value;
    const search = (document.getElementById('signalSearch') && document.getElementById('signalSearch').value || '').toLowerCase();
    signalsFiltered = MOCK_SIGNALS.filter(function (s) {
      if (source && s.source !== source) return false;
      if (sentiment && s.sentiment !== sentiment) return false;
      if (search && s.headline.toLowerCase().indexOf(search) < 0 && s.snippet.toLowerCase().indexOf(search) < 0 && (s.symbol || '').toLowerCase().indexOf(search) < 0) return false;
      return true;
    });
    renderSignals();
  }

  function renderSignals() {
    const container = document.getElementById('signalsFeed');
    if (!container) return;
    container.innerHTML = signalsFiltered.map(function (s) {
      const sentimentClass = s.sentiment === 'bullish' ? 'up' : (s.sentiment === 'bearish' ? 'down' : 'neutral');
      return (
        '<article class="signal-card" data-id="' + s.id + '">' +
        '<div class="signal-meta">' +
        '<span class="source-badge source-' + s.source + '">' + s.sourceLabel + '</span>' +
        '<span class="signal-time">' + s.time + '</span>' +
        (s.symbol ? '<span class="signal-symbol">' + s.symbol + '</span>' : '') +
        '</div>' +
        '<h3 class="signal-headline">' + escapeHtml(s.headline) + '</h3>' +
        '<p class="signal-snippet">' + escapeHtml(s.snippet) + '</p>' +
        '<span class="signal-sentiment ' + sentimentClass + '">' + s.sentiment + '</span>' +
        '</article>'
      );
    }).join('');
  }

  if (document.getElementById('signalSourceFilter')) {
    document.getElementById('signalSourceFilter').addEventListener('change', filterSignals);
    document.getElementById('signalSentimentFilter').addEventListener('change', filterSignals);
    document.getElementById('signalSearch').addEventListener('input', filterSignals);
  }

  // ——— AI Trade Recommendations ———
  function getExecutedTrades() {
    try {
      const raw = localStorage.getItem(STORAGE_AI_EXECUTED);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setExecutedTrades(list) {
    localStorage.setItem(STORAGE_AI_EXECUTED, JSON.stringify(list));
  }

  function executeAITrade(rec) {
    const list = getExecutedTrades();
    list.unshift({
      id: Date.now(),
      symbol: rec.symbol,
      action: rec.action,
      price: rec.price,
      time: new Date().toLocaleString()
    });
    setExecutedTrades(list);
    renderAIExecuted();
  }

  function renderAIRecommendations() {
    const grid = document.getElementById('aiRecommendationsGrid');
    if (!grid) return;
    grid.innerHTML = MOCK_AI_RECOMMENDATIONS.map(function (r) {
      const actionClass = r.action === 'BUY' ? 'up' : (r.action === 'SELL' ? 'down' : 'neutral');
      return (
        '<div class="recommendation-card" data-id="' + r.id + '">' +
        '<div class="rec-header">' +
        '<span class="rec-symbol">' + r.symbol + '</span>' +
        '<span class="rec-action ' + actionClass + '">' + r.action + '</span>' +
        '</div>' +
        '<div class="rec-confidence">' +
        '<span class="confidence-label">Confidence</span>' +
        '<div class="confidence-bar"><div class="confidence-fill" style="width:' + r.confidence + '%"></div></div>' +
        '<span class="confidence-value">' + r.confidence + '%</span>' +
        '</div>' +
        '<p class="rec-reasoning">' + escapeHtml(r.reasoning) + '</p>' +
        '<div class="rec-footer">' +
        '<span class="rec-price">' + formatPrice(r.price) + '</span>' +
        '<button type="button" class="btn btn-primary btn-execute" data-symbol="' + r.symbol + '" data-action="' + r.action + '" data-price="' + r.price + '">Execute</button>' +
        '</div>' +
        '</div>'
      );
    }).join('');

    grid.querySelectorAll('.btn-execute').forEach(function (btn) {
      btn.addEventListener('click', function () {
        executeAITrade({
          symbol: btn.dataset.symbol,
          action: btn.dataset.action,
          price: parseFloat(btn.dataset.price)
        });
      });
    });
    renderAIExecuted();
  }

  function renderAIExecuted() {
    const list = getExecutedTrades();
    const ul = document.getElementById('aiExecutedList');
    const emptyEl = document.getElementById('aiExecutedEmpty');
    if (!ul || !emptyEl) return;
    if (list.length === 0) {
      ul.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    ul.innerHTML = list.map(function (t) {
      const actionClass = t.action === 'BUY' ? 'up' : 'down';
      return (
        '<li class="executed-item">' +
        '<span class="executed-symbol">' + t.symbol + '</span>' +
        '<span class="executed-action ' + actionClass + '">' + t.action + '</span>' +
        '<span class="executed-price">' + formatPrice(t.price) + '</span>' +
        '<span class="executed-time">' + t.time + '</span>' +
        '</li>'
      );
    }).join('');
  }

  if (document.getElementById('aiAutoTradeToggle')) {
    document.getElementById('aiAutoTradeToggle').addEventListener('change', function () {
      document.getElementById('aiStatus').textContent = this.checked
        ? 'Auto-trade enabled (simulated) — AI will execute recommendations automatically'
        : 'AI analysis active — recommendations refresh periodically';
    });
  }

  // ——— Stock Screener ———
  let screenerData = MOCK_STOCKS.slice();
  let screenerSort = { key: 'symbol', dir: 1 };

  function filterScreener() {
    const sector = document.getElementById('filterSector').value;
    const priceMin = parseFloat(document.getElementById('filterPriceMin').value) || 0;
    const priceMax = parseFloat(document.getElementById('filterPriceMax').value) || Infinity;
    const changeFilter = document.getElementById('filterChange').value;
    const search = (document.getElementById('screenerSearch').value || '').toLowerCase();

    screenerData = MOCK_STOCKS.filter(function (s) {
      if (sector && s.sector !== sector) return false;
      if (s.price < priceMin) return false;
      if (priceMax !== Infinity && s.price > priceMax) return false;
      if (changeFilter === 'up' && s.change < 0) return false;
      if (changeFilter === 'down' && s.change >= 0) return false;
      if (search && s.symbol.toLowerCase().indexOf(search) < 0 && s.name.toLowerCase().indexOf(search) < 0) return false;
      return true;
    });

    sortScreener(screenerSort.key, screenerSort.dir);
    renderScreenerTable();
  }

  function sortScreener(key, dir) {
    screenerSort = { key: key, dir: dir };
    screenerData.sort(function (a, b) {
      let va = a[key], vb = b[key];
      if (typeof va === 'number' && typeof vb === 'number') return dir * (va - vb);
      if (typeof va === 'string' && typeof vb === 'string') return dir * va.localeCompare(vb);
      return 0;
    });
  }

  function renderScreenerTable() {
    const tbody = document.getElementById('screenerTableBody');
    const watchlist = getWatchlist();
    tbody.innerHTML = screenerData.map(function (s) {
      const changeClass = s.change >= 0 ? 'up' : 'down';
      const changeStr = (s.change >= 0 ? '+' : '') + s.change + '%';
      const inWatchlist = watchlist.some(function (w) { return w.symbol === s.symbol; });
      return (
        '<tr>' +
        '<td class="symbol-cell">' + s.symbol + '</td>' +
        '<td>' + s.name + '</td>' +
        '<td>' + s.sector + '</td>' +
        '<td class="num-cell">' + formatPrice(s.price) + '</td>' +
        '<td class="num-cell ' + changeClass + '">' + changeStr + '</td>' +
        '<td class="num-cell">' + s.volume + '</td>' +
        '<td class="num-cell">' + s.marketCap + '</td>' +
        '<td>' +
        (inWatchlist
          ? '<span class="btn-remove" style="cursor:default;opacity:0.6">In list</span>'
          : '<button type="button" class="btn-add-watchlist" data-symbol="' + s.symbol + '" data-name="' + escapeHtml(s.name) + '" data-price="' + s.price + '" data-change="' + s.change + '">Add to Watchlist</button>') +
        '</td></tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-add-watchlist').forEach(function (btn) {
      btn.addEventListener('click', function () {
        addToWatchlist({
          symbol: btn.dataset.symbol,
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price),
          change: parseFloat(btn.dataset.change)
        });
        filterScreener();
      });
    });
  }

  function formatPrice(p) {
    if (p >= 1000) return p.toLocaleString();
    return typeof p === 'number' ? p.toFixed(2) : p;
  }

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  document.getElementById('screenerApply').addEventListener('click', filterScreener);
  document.getElementById('screenerReset').addEventListener('click', function () {
    document.getElementById('filterSector').value = '';
    document.getElementById('filterPriceMin').value = '';
    document.getElementById('filterPriceMax').value = '';
    document.getElementById('filterChange').value = '';
    document.getElementById('screenerSearch').value = '';
    screenerData = MOCK_STOCKS.slice();
    sortScreener('symbol', 1);
    renderScreenerTable();
  });

  document.getElementById('screenerSearch').addEventListener('input', filterScreener);

  document.querySelectorAll('#screenerTable th[data-sort]').forEach(function (th) {
    th.addEventListener('click', function () {
      const key = th.getAttribute('data-sort');
      const dir = screenerSort.key === key ? -screenerSort.dir : 1;
      sortScreener(key, dir);
      renderScreenerTable();
    });
  });

  function renderScreener() {
    sortScreener(screenerSort.key, screenerSort.dir);
    renderScreenerTable();
  }

  // ——— Watchlist (localStorage) ———
  function getWatchlist() {
    try {
      const raw = localStorage.getItem(STORAGE_WATCHLIST);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setWatchlist(list) {
    localStorage.setItem(STORAGE_WATCHLIST, JSON.stringify(list));
  }

  function addToWatchlist(item) {
    const list = getWatchlist();
    if (list.some(function (w) { return w.symbol === item.symbol; })) return;
    list.push({
      symbol: item.symbol,
      name: item.name || item.symbol,
      price: item.price != null ? item.price : 0,
      change: item.change != null ? item.change : 0
    });
    setWatchlist(list);
    renderWatchlist();
    syncChartWatchlist(list);
  }

  function removeFromWatchlist(symbol) {
    let list = getWatchlist().filter(function (w) { return w.symbol !== symbol; });
    setWatchlist(list);
    renderWatchlist();
    syncChartWatchlist(list);
  }

  function renderWatchlist() {
    const list = getWatchlist();
    const tbody = document.getElementById('watchlistTableBody');
    const emptyEl = document.getElementById('watchlistEmpty');

    if (list.length === 0) {
      tbody.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    tbody.innerHTML = list.map(function (w) {
      const changeClass = w.change >= 0 ? 'up' : 'down';
      const changeStr = (w.change >= 0 ? '+' : '') + w.change + '%';
      return (
        '<tr>' +
        '<td class="symbol-cell">' + w.symbol + '</td>' +
        '<td class="num-cell">' + formatPrice(w.price) + '</td>' +
        '<td class="num-cell ' + changeClass + '">' + changeStr + '</td>' +
        '<td class="num-cell">—</td>' +
        '<td><button type="button" class="btn-remove" data-symbol="' + w.symbol + '">Remove</button></td>' +
        '</tr>'
      );
    }).join('');

    tbody.querySelectorAll('.btn-remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeFromWatchlist(btn.dataset.symbol);
      });
    });
  }

  document.getElementById('watchlistAddBtn').addEventListener('click', function () {
    const input = document.getElementById('watchlistSymbolInput');
    const sym = (input.value || '').trim().toUpperCase();
    if (!sym) return;
    const stock = MOCK_STOCKS.find(function (s) { return s.symbol === sym; });
    addToWatchlist(stock || { symbol: sym, name: sym, price: 0, change: 0 });
    input.value = '';
  });

  document.getElementById('watchlistSymbolInput').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('watchlistAddBtn').click();
  });

  var chartRebindClicks = function () {};

  function syncChartWatchlist(list) {
    const ul = document.getElementById('chartWatchlist');
    if (!ul) return;
    const defaultItems = [
      { symbol: 'AAPL', price: '178.42', change: '+1.2%', up: true },
      { symbol: 'GOOGL', price: '141.85', change: '+0.8%', up: true },
      { symbol: 'MSFT', price: '378.91', change: '-0.3%', up: false }
    ];
    const items = list.length ? list.map(function (w) {
      return { symbol: w.symbol, price: formatPrice(w.price), change: (w.change >= 0 ? '+' : '') + w.change + '%', up: w.change >= 0 };
    }) : defaultItems;
    ul.innerHTML = items.map(function (item, i) {
      return (
        '<li class="symbol-item' + (i === 0 ? ' active' : '') + '" data-symbol="' + item.symbol + '">' +
        '<span class="symbol-name">' + item.symbol + '</span>' +
        '<span class="symbol-price">' + item.price + '</span>' +
        '<span class="symbol-change ' + (item.up ? 'up' : 'down') + '">' + item.change + '</span>' +
        '</li>'
      );
    }).join('');
    chartRebindClicks();
  }

  // ——— Price Alerts (localStorage) ———
  function getAlerts() {
    try {
      const raw = localStorage.getItem(STORAGE_ALERTS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function setAlerts(list) {
    localStorage.setItem(STORAGE_ALERTS, JSON.stringify(list));
  }

  function addAlert(symbol, condition, targetPrice) {
    const list = getAlerts();
    list.push({ id: Date.now(), symbol: symbol.toUpperCase(), condition: condition, targetPrice: parseFloat(targetPrice) });
    setAlerts(list);
    renderAlerts();
  }

  function removeAlert(id) {
    let list = getAlerts().filter(function (a) { return a.id !== id; });
    setAlerts(list);
    renderAlerts();
  }

  function renderAlerts() {
    const list = getAlerts();
    const ul = document.getElementById('alertsList');
    const emptyEl = document.getElementById('alertsEmpty');

    if (list.length === 0) {
      ul.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    ul.innerHTML = list.map(function (a) {
      const condText = a.condition === 'above' ? 'Above' : 'Below';
      return (
        '<li class="alert-item">' +
        '<div><span class="alert-symbol">' + a.symbol + '</span> — <span class="alert-condition">' + condText + '</span> <span class="alert-price">' + a.targetPrice + '</span></div>' +
        '<button type="button" class="btn-delete-alert" data-id="' + a.id + '">Delete</button>' +
        '</li>'
      );
    }).join('');

    ul.querySelectorAll('.btn-delete-alert').forEach(function (btn) {
      btn.addEventListener('click', function () {
        removeAlert(parseInt(btn.dataset.id, 10));
      });
    });
  }

  document.getElementById('alertAddBtn').addEventListener('click', function () {
    const symbol = (document.getElementById('alertSymbol').value || '').trim();
    const condition = document.getElementById('alertCondition').value;
    const price = document.getElementById('alertPrice').value;
    if (!symbol || !price || isNaN(parseFloat(price))) return;
    addAlert(symbol, condition, price);
    document.getElementById('alertSymbol').value = '';
    document.getElementById('alertPrice').value = '';
  });

  // ——— Charts (only when section visible) ———
  const chartArea = document.getElementById('chartArea');
  const chartCanvas = document.getElementById('chartCanvas');
  const crosshairH = document.getElementById('crosshairH');
  const crosshairV = document.getElementById('crosshairV');

  if (chartArea && chartCanvas) {
    const ctx = chartCanvas.getContext('2d');
    const COLORS = { bg: '#131722', grid: '#2a2e39', up: '#26a69a', down: '#ef5350', text: '#787b86' };
    let chartData = [];
    const padding = { top: 20, right: 60, bottom: 30, left: 60 };

    function generateMockData(bars) {
      bars = bars || 80;
      const data = [];
      let price = 170 + Math.random() * 10;
      for (let i = 0; i < bars; i++) {
        const open = price;
        const change = (Math.random() - 0.48) * 2;
        price = price + change;
        data.push({
          open: open,
          high: Math.max(open, price) + Math.random() * 0.5,
          low: Math.min(open, price) - Math.random() * 0.5,
          close: price
        });
      }
      return data;
    }

    chartData = generateMockData();

    function getDrawRect() {
      const w = chartCanvas.width;
      const h = chartCanvas.height;
      return {
        x: padding.left,
        y: padding.top,
        width: w - padding.left - padding.right,
        height: h - padding.top - padding.bottom
      };
    }

    function drawGrid() {
      const rect = getDrawRect();
      const { x, y, width, height } = rect;
      ctx.strokeStyle = COLORS.grid;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const ly = y + (height / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, ly);
        ctx.lineTo(x + width, ly);
        ctx.stroke();
      }
      for (let i = 0; i <= 8; i++) {
        const lx = x + (width / 8) * i;
        ctx.beginPath();
        ctx.moveTo(lx, y);
        ctx.lineTo(lx, y + height);
        ctx.stroke();
      }
    }

    function drawChart() {
      if (!chartData.length) return;
      const rect = getDrawRect();
      const { x, y, width, height } = rect;
      const prices = chartData.flatMap(function (d) { return [d.high, d.low]; });
      const minPrice = Math.min.apply(null, prices) - 0.5;
      const maxPrice = Math.max.apply(null, prices) + 0.5;
      const priceRange = maxPrice - minPrice;
      const barWidth = Math.max(2, (width / chartData.length) * 0.7);
      const gap = width / chartData.length;

      chartData.forEach(function (bar, i) {
        const cx = x + (i + 0.5) * gap;
        const openY = y + height - ((bar.open - minPrice) / priceRange) * height;
        const closeY = y + height - ((bar.close - minPrice) / priceRange) * height;
        const highY = y + height - ((bar.high - minPrice) / priceRange) * height;
        const lowY = y + height - ((bar.low - minPrice) / priceRange) * height;
        const isUp = bar.close >= bar.open;
        ctx.strokeStyle = isUp ? COLORS.up : COLORS.down;
        ctx.fillStyle = isUp ? COLORS.up : COLORS.down;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, highY);
        ctx.lineTo(cx, lowY);
        ctx.stroke();
        const bodyTop = Math.min(openY, closeY);
        const bodyHeight = Math.max(2, Math.abs(closeY - openY));
        ctx.fillRect(cx - barWidth / 2, bodyTop, barWidth, bodyHeight);
        ctx.strokeRect(cx - barWidth / 2, bodyTop, barWidth, bodyHeight);
      });

      ctx.fillStyle = COLORS.text;
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      for (let i = 0; i <= 5; i++) {
        const price = maxPrice - (priceRange * i) / 5;
        const py = y + (height / 5) * i;
        ctx.fillText(price.toFixed(2), x - 8, py + 4);
      }
    }

    function render() {
      if (document.getElementById('section-charts').classList.contains('hidden')) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = chartArea.getBoundingClientRect();
      chartCanvas.width = rect.width * dpr;
      chartCanvas.height = rect.height * dpr;
      chartCanvas.style.width = rect.width + 'px';
      chartCanvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, rect.width, rect.height);
      drawGrid();
      drawChart();
    }

    function bindChartSymbolClicks() {
      const list = document.getElementById('chartWatchlist');
      if (!list) return;
      list.querySelectorAll('.symbol-item').forEach(function (item) {
        item.addEventListener('click', onSymbolClick);
      });
    }
    chartRebindClicks = bindChartSymbolClicks;

    function onSymbolClick() {
      document.querySelectorAll('#chartWatchlist .symbol-item').forEach(function (i) { i.classList.remove('active'); });
      this.classList.add('active');
      const name = this.querySelector('.symbol-name').textContent;
      const price = this.querySelector('.symbol-price').textContent;
      const changeEl = this.querySelector('.symbol-change');
      const change = changeEl.textContent;
      const up = changeEl.classList.contains('up');
      document.querySelector('.current-symbol').textContent = name;
      document.querySelector('.current-price').textContent = price;
      const currentChange = document.querySelector('.current-change');
      currentChange.textContent = change;
      currentChange.className = 'current-change ' + (up ? 'up' : 'down');
      chartData = generateMockData();
      render();
    }

    document.querySelectorAll('.tf-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tf-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        chartData = generateMockData();
        render();
      });
    });

    if (crosshairH && crosshairV) {
      chartArea.addEventListener('mousemove', function (e) {
        const rect = chartArea.getBoundingClientRect();
        crosshairH.style.display = 'block';
        crosshairV.style.display = 'block';
        crosshairH.style.top = (e.clientY - rect.top) + 'px';
        crosshairV.style.left = (e.clientX - rect.left) + 'px';
      });
      chartArea.addEventListener('mouseleave', function () {
        crosshairH.style.display = 'none';
        crosshairV.style.display = 'none';
      });
    }

    document.querySelectorAll('.draw-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.draw-btn').forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    window.addEventListener('resize', render);
    bindChartSymbolClicks();
    render();
  }

  // Initial render of dashboard views
  renderSignals();
  renderAIExecuted();
  renderScreenerTable();
  renderWatchlist();
  renderAlerts();
  var savedWatchlist = getWatchlist();
  if (savedWatchlist.length > 0) syncChartWatchlist(savedWatchlist);
})();
