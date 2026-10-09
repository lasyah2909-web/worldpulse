// Vercel Serverless Function
// Proxies requests to GNews API to avoid CORS issues on the deployed site
// URL pattern: /api/gnews?endpoint=top-headlines&category=general&...

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const API_KEY = '3948b34867317d54e1af49ea41d5cac1';

  // Pull endpoint out, pass everything else as query params
  const { endpoint = 'top-headlines', ...params } = req.query;

  const allowed = ['top-headlines', 'search'];
  if (!allowed.includes(endpoint)) {
    return res.status(400).json({ error: 'Invalid endpoint' });
  }

  const queryParams = new URLSearchParams({ ...params, apikey: API_KEY });
  const url = `https://gnews.io/api/v4/${endpoint}?${queryParams}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch from GNews', details: err.message });
  }
}
