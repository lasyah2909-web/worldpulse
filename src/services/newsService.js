import axios from 'axios';

const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1/latest';

// ─── Core fetch — simple single keyword queries work best ──────────────────
async function apiFetch(params) {
  const res = await axios.get(BASE, {
    params: { ...params, apikey: API_KEY, language: 'en', size: 10 },
    timeout: 12000,
  });
  if (res.data.status !== 'success') throw new Error(res.data.results?.message || 'API error');
  return res.data.results || [];
}

// ─── 3-level dedup ─────────────────────────────────────────────────────────
function dedup(articles) {
  const ids    = new Set();
  const titles = new Set();
  const slugs  = new Set();
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
  const seed = Math.abs((a.title||'x').split('').reduce((acc,c,i)=>acc+c.charCodeAt(0)*(i+1),0)) % 900 + 100;
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

function process(raw, filterFn) {
  // Apply relevance filter if provided
  const filtered = filterFn ? raw.filter(filterFn) : raw;
  // Fall back to all if filter is too aggressive
  const source   = filtered.length >= 5 ? filtered : raw;
  return dedup(source.map(norm))
    .sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// ─── AI Keywords filter ─────────────────────────────────────────────────────
const AI_RE = /\b(artificial intelligence|machine learning|deep learning|neural network|chatgpt|gpt-?[0-9]|openai|gemini|claude|llm|large language model|generative ai|ai model|robotics|automation|nlp|computer vision|agi|anthropic|mistral|copilot|midjourney|stable diffusion|diffusion model|transformer|ai safety|ai regulation|ai chip|nvidia ai|google ai|microsoft ai|apple ai|meta ai|xai|grok|llama|ai startup|ai tool)\b/i;

// ─── Cyber Keywords filter ──────────────────────────────────────────────────
const CY_RE = /\b(cybersecurity|cyber security|hacker|hacking|data breach|ransomware|malware|phishing|vulnerability|cve-?\d|zero.?day|exploit|soc |siem|soar|xdr|mdr|threat intelligence|threat actor|infosec|information security|grc|compliance|nist|iso.?27001|firewall|endpoint security|incident response|forensic|pentest|penetration test|ddos|botnet|trojan|spyware|dark web|cyber attack|cyber threat|encryption|identity theft|password|authentication|casb|dlp|iam |privileged access|cloud security)\b/i;

// ─── AI News — 4 focused single-keyword fetches ────────────────────────────
export async function fetchAI() {
  const calls = [
    apiFetch({ q: 'artificial intelligence' }),
    apiFetch({ q: 'ChatGPT' }),
    apiFetch({ q: 'OpenAI' }),
    apiFetch({ q: 'machine learning' }),
    apiFetch({ q: 'generative AI' }),
    apiFetch({ q: 'LLM' }),
  ];
  const results = await Promise.allSettled(calls);
  const raw     = results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  const articles = process(raw, a => AI_RE.test((a.title||'')+' '+(a.description||'')));
  return { status: 'ok', articles };
}

// ─── Cyber News — 5 focused single-keyword fetches ─────────────────────────
export async function fetchCyber() {
  const calls = [
    apiFetch({ q: 'cybersecurity' }),
    apiFetch({ q: 'hacking' }),
    apiFetch({ q: 'ransomware' }),
    apiFetch({ q: 'data breach' }),
    apiFetch({ q: 'malware' }),
    apiFetch({ q: 'cyber attack' }),
    apiFetch({ q: 'vulnerability' }),
  ];
  const results = await Promise.allSettled(calls);
  const raw     = results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  const articles = process(raw, a => CY_RE.test((a.title||'')+' '+(a.description||'')));
  return { status: 'ok', articles };
}

// ─── Search ─────────────────────────────────────────────────────────────────
export async function searchInSection(query, section) {
  const raw = await apiFetch({ q: query });
  const filterFn = section === 'ai' ? (a => AI_RE.test((a.title||'')+' '+(a.description||''))) : null;
  return { status: 'ok', articles: process(raw, filterFn) };
}

// ─── Helpers ────────────────────────────────────────────────────────────────
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
  return new Date(d).toLocaleString([],{month:'short',day:'numeric',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
