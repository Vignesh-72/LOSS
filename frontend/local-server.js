// frontend/local-server.js
import express from 'express';
import cors from 'cors';
import YahooFinance from 'yahoo-finance2';

const app = express();
const PORT = 3001; // We will run this on port 3001

app.use(cors());

// This matches the exact route your App.jsx calls
app.get('/api/stock-data', async (req, res) => {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required' });
  }

  try {
    const yahooFinance = new YahooFinance({
        suppressNotices: ['yahooSurvey', 'ripHistorical'] 
    });

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    const period1 = oneYearAgo.toISOString().split('T')[0];
    const period2 = today.toISOString().split('T')[0];

    console.log(`[Local Relay] Fetching ${ticker} chart...`);

    const chartResult = await yahooFinance.chart(ticker, { 
      period1, period2, interval: '1d' 
    });
    const history = chartResult.quotes;
    
    const quote = await yahooFinance.quote(ticker);
    
    let profile = {}, stats = {};
    try {
        const profileData = await yahooFinance.quoteSummary(ticker, { modules: [ "assetProfile", "summaryDetail" ] });
        profile = profileData.assetProfile || {};
        stats = profileData.summaryDetail || {};
    } catch (e) {
        console.warn("Profile fetch skipped");
    }

    res.json({ history, quote, profile, stats });

  } catch (error) {
    console.error("Relay Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Local Relay Server running at http://localhost:${PORT}`);
});