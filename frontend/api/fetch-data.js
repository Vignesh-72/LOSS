import { YahooFinance } from 'yahoo-finance2'; // 1. Change to Named Import

export default async function handler(req, res) {
  const { ticker } = req.query;

  if (!ticker) {
    return res.status(400).json({ error: 'Ticker symbol is required' });
  }

  // 2. Instantiate the library manually for every request
  const yahooFinance = new YahooFinance(); 

  try {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const period1 = oneYearAgo.toISOString().split('T')[0];

    // 3. Suppress notices on the *instance* not the global object
    yahooFinance.suppressNotices(['yahooSurvey']);

    console.log(`Fetching data for ${ticker} starting ${period1}`);

    const history = await yahooFinance.historical(ticker, { 
      period1: period1, 
      interval: '1d' 
    });

    if (!history || history.length === 0) {
        throw new Error('Yahoo returned no history data');
    }

    const quote = await yahooFinance.quote(ticker);
    
    let profile = {}, stats = {};
    try {
        const profileData = await yahooFinance.quoteSummary(ticker, { modules: [ "assetProfile", "summaryDetail" ] });
        profile = profileData.assetProfile || {};
        stats = profileData.summaryDetail || {};
    } catch (e) {
        console.warn("Profile fetch failed (non-critical):", e.message);
    }

    res.status(200).json({ history, quote, profile, stats });

  } catch (error) {
    console.error("CRITICAL VERCEL ERROR:", error);
    res.status(500).json({ error: `Failed to fetch data: ${error.message}` });
  }
}