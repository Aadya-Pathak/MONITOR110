/**
 * Monitor 110 — Basic chart & UI interactivity
 */

(function () {
  const chartArea = document.getElementById('chartArea');
  const chartCanvas = document.getElementById('chartCanvas');
  const ctx = chartCanvas.getContext('2d');
  const crosshairH = document.getElementById('crosshairH');
  const crosshairV = document.getElementById('crosshairV');

  const COLORS = {
    bg: '#131722',
    grid: '#2a2e39',
    line: '#2962ff',
    up: '#26a69a',
    down: '#ef5350',
    text: '#787b86',
    textBright: '#d1d4dc'
  };

  // Generate fake OHLC/candle data for demo
  function generateMockData(bars = 80) {
    const data = [];
    let price = 170 + Math.random() * 10;
    for (let i = 0; i < bars; i++) {
      const open = price;
      const change = (Math.random() - 0.48) * 2;
      price = price + change;
      const high = Math.max(open, price) + Math.random() * 0.5;
      const low = Math.min(open, price) - Math.random() * 0.5;
      const close = price;
      data.push({ open, high, low, close });
    }
    return data;
  }

  let chartData = generateMockData();
  let padding = { top: 20, right: 60, bottom: 30, left: 60 };

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

    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const ly = y + (height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(x, ly);
      ctx.lineTo(x + width, ly);
      ctx.stroke();
    }
    const vLines = 8;
    for (let i = 0; i <= vLines; i++) {
      const lx = x + (width / vLines) * i;
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

    const prices = chartData.flatMap(d => [d.high, d.low]);
    const minPrice = Math.min(...prices) - 0.5;
    const maxPrice = Math.max(...prices) + 0.5;
    const priceRange = maxPrice - minPrice;

    const barWidth = Math.max(2, (width / chartData.length) * 0.7);
    const gap = width / chartData.length;

    chartData.forEach((bar, i) => {
      const cx = x + (i + 0.5) * gap;
      const openY = y + height - ((bar.open - minPrice) / priceRange) * height;
      const closeY = y + height - ((bar.close - minPrice) / priceRange) * height;
      const highY = y + height - ((bar.high - minPrice) / priceRange) * height;
      const lowY = y + height - ((bar.low - minPrice) / priceRange) * height;

      const isUp = bar.close >= bar.open;
      ctx.strokeStyle = isUp ? COLORS.up : COLORS.down;
      ctx.fillStyle = isUp ? COLORS.up : COLORS.down;
      ctx.lineWidth = 1;

      // Wick
      ctx.beginPath();
      ctx.moveTo(cx, highY);
      ctx.lineTo(cx, lowY);
      ctx.stroke();

      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(2, Math.abs(closeY - openY));
      ctx.fillRect(cx - barWidth / 2, bodyTop, barWidth, bodyHeight);
      ctx.strokeRect(cx - barWidth / 2, bodyTop, barWidth, bodyHeight);
    });

    // Price scale labels
    ctx.fillStyle = COLORS.text;
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const price = maxPrice - (priceRange * i) / steps;
      const py = y + (height / steps) * i;
      ctx.fillText(price.toFixed(2), x - 8, py + 4);
    }
  }

  function render() {
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

  // Timeframe buttons
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      chartData = generateMockData();
      render();
    });
  });

  // Symbol list — click to "load" symbol
  document.querySelectorAll('.symbol-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.symbol-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      const name = this.querySelector('.symbol-name').textContent;
      const price = this.querySelector('.symbol-price').textContent;
      const change = this.querySelector('.symbol-change').textContent;
      document.querySelector('.current-symbol').textContent = name;
      document.querySelector('.current-price').textContent = price;
      document.querySelector('.current-change').textContent = change;
      document.querySelector('.current-change').className = 'current-change ' + (this.querySelector('.symbol-change').classList.contains('up') ? 'up' : 'down');
      chartData = generateMockData();
      render();
    });
  });

  // Crosshair on mouse move
  chartArea.addEventListener('mousemove', function (e) {
    const rect = chartArea.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    crosshairH.style.display = 'block';
    crosshairV.style.display = 'block';
    crosshairH.style.top = y + 'px';
    crosshairV.style.left = x + 'px';
  });

  chartArea.addEventListener('mouseleave', function () {
    crosshairH.style.display = 'none';
    crosshairV.style.display = 'none';
  });

  // Drawing tool buttons
  document.querySelectorAll('.draw-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.draw-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Resize
  window.addEventListener('resize', render);
  render();
})();
