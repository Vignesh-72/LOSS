// frontend/api/stock-data.js
import YahooFinance from 'yahoo-finance2';

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required' });
  }

  try {
    // === v3 FIX: Create a fresh instance for every request ===
    const yahooFinance = new YahooFinance(); 

    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    // Yahoo requires strict ISO date format (YYYY-MM-DD)
    const period1 = oneYearAgo.toISOString().split('T')[0];

    // Suppress warnings to keep logs clean
    yahooFinance.suppressNotices(['yahooSurvey', 'urlDeprecation']);

    console.log(`Fetching ${ticker} data from ${period1}...`);

    // 1. Fetch History
    const history = await yahooFinance.historical(ticker, { 
      period1: period1, 
      interval: '1d' 
    });

    // 2. Fetch Quote
    const quote = await yahooFinance.quote(ticker);
    
    // 3. Fetch Profile (Safely)
    let profile = {}, stats = {};
    try {
        const profileData = await yahooFinance.quoteSummary(ticker, { modules: [ "assetProfile", "summaryDetail" ] });
        profile = profileData.assetProfile || {};
        stats = profileData.summaryDetail || {};
    } catch (e) {
        console.warn("Profile fetch skipped:", e.message);
    }

    res.status(200).json({ history, quote, profile, stats });

  } catch (error) {
    console.error("VERCEL ERROR:", error);
    res.status(500).json({ error: error.message });
  }
}