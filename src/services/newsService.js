import axios from 'axios';

const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1/latest';

// ─── fetch ─────────────────────────────────────────────────────────────────
async function apiFetch(params) {
  const res = await axios.get(BASE, {
    params: { ...params, apikey: API_KEY },
    timeout: 12000,
  });
  if (res.data.status !== 'success') throw new Error(res.data.results?.message || 'API error');
  return res.data.results || [];
}

// ─── dedup (3 levels) ──────────────────────────────────────────────────────
function dedup(articles) {
  const ids     = new Set();
  const titles  = new Set();
  const slugs   = new Set();
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

// ─── normalise ─────────────────────────────────────────────────────────────
function norm(a, idx) {
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

function process(raw) {
  return dedup(raw.map(norm)).sort((a,b) => new Date(b.publishedAt)-new Date(a.publishedAt));
}

// ─── AI news ───────────────────────────────────────────────────────────────
export async function fetchAI() {
  const calls = [
    apiFetch({ q: 'artificial intelligence OR ChatGPT OR GPT OR LLM OR OpenAI', language: 'en', size: 10 }),
    apiFetch({ q: 'machine learning OR deep learning OR AI model OR neural network', language: 'en', size: 10 }),
    apiFetch({ q: 'AI startup OR AI regulation OR generative AI OR AI safety', language: 'en', size: 10 }),
    apiFetch({ category: 'technology', language: 'en', size: 10 }),
  ];
  const res = await Promise.allSettled(calls);
  const raw = res.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  // Extra filter — keep only articles with AI-related keywords
  const aiKw = /\b(ai|artificial intelligence|chatgpt|gpt|llm|openai|gemini|claude|machine learning|deep learning|neural|robot|automation|generative|language model|anthropic|mistral|copilot|agi|midjourney|stable diffusion)\b/i;
  const filtered = raw.filter(a => aiKw.test(a.title + ' ' + (a.description||'')));
  const articles = process(filtered.length > 5 ? filtered : raw);
  return { status:'ok', articles };
}

// ─── Cybersecurity news ────────────────────────────────────────────────────
export async function fetchCyber() {
  const calls = [
    apiFetch({ q: 'cybersecurity OR hacking OR data breach OR ransomware', language: 'en', size: 10 }),
    apiFetch({ q: 'SOC OR SIEM OR threat intelligence OR vulnerability OR CVE', language: 'en', size: 10 }),
    apiFetch({ q: 'GRC OR compliance OR NIST OR ISO 27001 OR risk management security', language: 'en', size: 10 }),
    apiFetch({ q: 'malware OR phishing OR zero day OR exploit OR cyber attack', language: 'en', size: 10 }),
    apiFetch({ q: 'endpoint security OR firewall OR SOAR OR XDR OR MDR OR CASB', language: 'en', size: 10 }),
  ];
  const res = await Promise.allSettled(calls);
  const raw = res.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  const cyKw = /\b(cyber|security|hack|breach|ransomware|malware|phishing|vulnerability|cve|soc|siem|soar|xdr|mdr|grc|compliance|nist|iso.?27001|firewall|exploit|threat|infosec|pentest|zero.?day|casb|dlp|iam|identity|endpoint|encryption|forensic|incident response)\b/i;
  const filtered = raw.filter(a => cyKw.test(a.title + ' ' + (a.description||'')));
  const articles = process(filtered.length > 5 ? filtered : raw);
  return { status:'ok', articles };
}

// ─── Search ────────────────────────────────────────────────────────────────
export async function searchInSection(query, section) {
  const base = section === 'ai'
    ? `${query} artificial intelligence`
    : `${query} cybersecurity`;
  const raw = await apiFetch({ q: base, language: 'en', size: 10 });
  return { status:'ok', articles: process(raw) };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
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
