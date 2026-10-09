const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1';

module.exports = async function handler(req, res) {
  // CORS — allow any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { endpoint = 'latest', ...rest } = req.query;

    // Only allow safe endpoints
    if (!['latest', 'news'].includes(endpoint)) {
      return res.status(400).json({ error: 'Invalid endpoint' });
    }

    const params = new URLSearchParams({ ...rest, apikey: API_KEY });
    const url    = `${BASE}/${endpoint}?${params}`;

    const upstream = await fetch(url);
    const data     = await upstream.json();

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
