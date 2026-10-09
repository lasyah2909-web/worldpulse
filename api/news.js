// Vercel Serverless Function — runs on the server, not the browser
// This proxies requests to NewsAPI.org so the free plan domain restriction is bypassed
// The API key lives in a Vercel environment variable, never exposed to the client

export default async function handler(req, res) {
  // CORS headers so the frontend can call this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NEWS_API_KEY environment variable not set' });
  }

  const { endpoint = 'top-headlines', ...params } = req.query;

  // Only allow safe NewsAPI endpoints
  const allowed = ['top-headlines', 'everything'];
  if (!allowed.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  const queryParams = new URLSearchParams({ ...params, apiKey });
  const url = `https://newsapi.org/v2/${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch from NewsAPI', details: err.message });
  }
}
