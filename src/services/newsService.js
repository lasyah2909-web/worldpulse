import axios from 'axios';

const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1/latest';

// ─── In-memory cache — avoids burning rate limit on every load ────────────
// Free plan: 200 requests/day. We cache for 15 minutes so we use ~96 req/day.
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes
const cache = {};

function fromCache(key) {
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}
function toCache(key, data) {
  cache[key] = { ts: Date.now(), data };
}

// ─── Single fetch with caching ─────────────────────────────────────────────
async function apiFetch(q) {
  const hit = fromCache(q);
  if (hit) return hit;
  try {
    const res = await axios.get(BASE, {
      params: { apikey: API_KEY, language: 'en', size: 10, q },
      timeout: 12000,
    });
    if (res.data.status !== 'success') return [];
    const results = res.data.results || [];
    toCache(q, results);
    return results;
  } catch {
    return [];
  }
}

// ─── Sequential fetch — avoids rate limit by spacing requests ─────────────
async function fetchSequential(queries) {
  const all = [];
  for (const q of queries) {
    const results = await apiFetch(q);
    all.push(...results);
    // Small delay between requests to avoid rate limiting
    if (!fromCache(q)) await new Promise(r => setTimeout(r, 300));
  }
  return all;
}

// ─── Dedup: 3 levels ──────────────────────────────────────────────────────
function dedup(articles) {
  const ids = new Set(), titles = new Set(), slugs = new Set();
  return articles.filter(a => {
    if (!a.title) return false;
    if (a.articleId && ids.has(a.articleId)) return false;
    if (a.articleId) ids.add(a.articleId);
    const t = a.title.toLowerCase().replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim().slice(0,60);
    if (titles.has(t)) return false;
    titles.add(t);
    const s = t.split(' ').slice(0,5).join('-');
    if (s.length > 8 && slugs.has(s)) return false;
    slugs.add(s);
    return true;
  });
}

// ─── Normalise ─────────────────────────────────────────────────────────────
function norm(a) {
  const seed = Math.abs((a.title||'x').split('').reduce((n,c,i)=>n+c.charCodeAt(0)*(i+1),0)) % 900 + 100;
  return {
    articleId:   a.article_id,
    title:       a.title,
    description: a.description || '',
    url:         a.link,
    urlToImage:  a.image_url || `https://picsum.photos/seed/${seed}/800/450`,
    publishedAt: a.pubDate,
    source:      { name: a.source_name || a.source_id || 'Source' },
    author:      a.creator?.[0] || null,
  };
}

// ─── Relevance filters ────────────────────────────────────────────────────
const AI_RE = /\b(artificial intelligence|machine learning|deep learning|neural network|chatgpt|gpt-?[0-9o]|openai|gemini|claude|llm|large language model|generative ai|foundation model|robotics|nlp|computer vision|agi|anthropic|mistral|copilot|midjourney|stable diffusion|diffusion model|transformer model|ai safety|ai regulation|ai chip|ai startup|ai tool|ai system|ai researcher|ai company|language model|xai|grok|llama|hugging face|deepmind|nvidia ai|ai powered|ai driven|ai generated)\b/i;

const CY_RE = /\b(cybersecurity|cyber security|cyber attack|hacker|hacking|data breach|ransomware|malware|phishing|vulnerability|cve|zero.?day|exploit|soc |siem|soar|xdr|mdr|threat intelligence|threat actor|infosec|information security|grc|compliance|nist|iso.?27001|pci.?dss|hipaa|firewall|endpoint security|incident response|digital forensic|pentest|penetration test|ddos|botnet|trojan|spyware|dark web|encryption|identity theft|authentication|privileged access|cloud security|security audit|security assessment|vulnerability assessment|code audit|audit finding|security posture|red team|blue team|purple team|threat model|security compliance|security framework|security operations|security breach|security incident|security flaw|security patch|patch management|bug bounty|responsible disclosure|supply chain attack|third party risk)\b/i;

// ─── Process: normalise → filter → dedup → sort ───────────────────────────
function process(raw, filterRe) {
  const normed   = raw.filter(a => a.title).map(norm);
  const filtered = normed.filter(a => filterRe.test(a.title + ' ' + a.description));
  const source   = filtered.length >= 6 ? filtered : normed;
  return dedup(source).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// ─── AI News — 3 fetches only (saves rate limit) ─────────────────────────
export async function fetchAI() {
  // Use 3 broad queries instead of 6 narrow ones — same coverage, half the requests
  const raw = await fetchSequential([
    'artificial intelligence',
    'ChatGPT OpenAI',
    'machine learning generative AI',
  ]);
  return { status: 'ok', articles: process(raw, AI_RE) };
}

// ─── Cyber + Audit News — 3 fetches only ─────────────────────────────────
export async function fetchCyber() {
  const raw = await fetchSequential([
    'cybersecurity hacking',
    'data breach ransomware malware',
    'security audit vulnerability',
  ]);
  return { status: 'ok', articles: process(raw, CY_RE) };
}

// ─── Search ───────────────────────────────────────────────────────────────
export async function searchInSection(query, section) {
  const raw      = await apiFetch(query);
  const normed   = raw.filter(a => a.title).map(norm);
  const articles = dedup(normed).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return { status: 'ok', articles };
}

// ─── Date helpers ─────────────────────────────────────────────────────────
export function timeAgo(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 60)     return 'Just now';
  if (s < 3600)   return `${Math.floor(s/60)}m ago`;
  if (s < 86400)  return `${Math.floor(s/3600)}h ago`;
  if (s < 604800) return `${Math.floor(s/86400)}d ago`;
  return new Date(d).toLocaleDateString();
}

export function fullDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleString([],{
    month:'short', day:'numeric', year:'numeric',
    hour:'2-digit', minute:'2-digit',
  });
}
