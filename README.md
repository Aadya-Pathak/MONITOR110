# Monitor110 – Real-Time Market Intelligence

Monitor110 is an AI-powered platform that transforms real-time online market chatter into actionable trading signals.

## 🚀 Problem
Modern financial markets move on sentiment before fundamentals.  
Millions of posts across Reddit, news, and forums generate early signals — but humans and traditional tools cannot process them in real time.

## 💡 Solution
Monitor110 listens to live market conversations and uses AI to:
- Analyze financial sentiment
- Detect sudden sentiment shifts (velocity)
- Filter noise using confidence scoring
- Generate early bullish or bearish alerts

## 🧠 Core Features
- Real-time Reddit & news ingestion  
- Financial sentiment analysis (FinBERT)  
- Stock entity detection (TSLA, AAPL, NVDA, etc.)  
- Sentiment velocity tracking  
- Confidence-based signal filtering  
- Live dashboard with alerts  

## 🏗 Architecture
Data Sources → AI Processing → Signal Engine → Alerts → Dashboard


## 🧪 Tech Stack
- Backend: Python, FastAPI **|** Node.js API (see below)
- ML: HuggingFace FinBERT
- Frontend: React **|** HTML/CSS/JS dashboard (in repo)
- Database: SQLite
- Data Sources: Reddit, News APIs

### Node.js backend (this repo)
A separate Node.js backend is included for stock data, news, and alerts. **Frontend (index.html, script.js, styles.css) is unchanged.**

1. **Install and run**
   ```bash
   npm install
   cp .env.example .env
   # Edit .env: set STOCKDATA_API_KEY and STOCKNEWS_API_KEY
   npm start
   ```
   Server runs at `http://localhost:3000`. The app also serves the frontend from the same origin.

2. **API endpoints**
   - **Stock quote:** `GET /api/quote?symbol=AAPL` (StockData.org)
   - **Market news:** `GET /api/market-news?items=20` (Stock News API, SPY/QQQ/DIA)
   - **Stock news:** `GET /api/stock-news?tickers=AAPL&items=20` (Stock News API)
   - **Alerts:** `GET /api/alerts`, `POST /api/alerts`, `DELETE /api/alerts/:id`, `GET /api/alerts/triggered`
   - Alerts engine runs every 60s: checks each alert’s symbol against target price and records triggered events for `GET /api/alerts/triggered`.

## 🎯 Hackathon Goal
Deliver early market intelligence signals **before traditional news reacts**.

## 👥 Team
- Aadya Pathak  
- Anushka Dogra  
- Shubhangi Raj  
- Ashutosh Kumar Kant
