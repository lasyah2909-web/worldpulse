import axios from 'axios';

const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1/latest';

// ─── Single keyword fetch — simple queries work best on free plan ──────────
async function apiFetch(q) {
  try {
    const res = await axios.get(BASE, {
      params: { apikey: API_KEY, language: 'en', size: 10, q },
      timeout: 10000,
    });
    if (res.data.status !== 'success') return [];
    return res.data.results || [];
  } catch {
    return []; // silently skip failed fetches
  }
}

// ─── Dedup: article_id + normalised title + first-5-word slug ─────────────
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

// ─── Normalise to consistent shape ────────────────────────────────────────
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

// ─── Process: normalise → filter → dedup → sort newest first ──────────────
function process(raw, filterRe) {
  const normed   = raw.filter(a => a.title).map(norm);
  const filtered = normed.filter(a => filterRe.test(a.title + ' ' + a.description));
  // Fallback: if strict filter removes too many, use all normalised
  const source   = filtered.length >= 8 ? filtered : normed;
  return dedup(source).sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// ─── AI relevance filter ───────────────────────────────────────────────────
const AI_RE = /\b(artificial intelligence|machine learning|deep learning|neural network|chatgpt|gpt-?[0-9o]|openai|gemini|claude|llm|large language model|generative ai|foundation model|robotics|nlp|computer vision|agi|anthropic|mistral|copilot|midjourney|stable diffusion|diffusion model|transformer model|ai safety|ai regulation|ai chip|ai startup|ai tool|ai system|ai researcher|ai company|language model|xai|grok|llama|hugging face|deepmind|nvidia ai|ai powered|ai driven|ai generated)\b/i;

// ─── Cybersecurity + Security Audit relevance filter ──────────────────────
const CY_RE = /\b(cybersecurity|cyber security|cyber attack|hacker|hacking|data breach|ransomware|malware|phishing|vulnerability|cve-?\d|zero.?day|exploit|soc |siem|soar|xdr|mdr|threat intelligence|threat actor|infosec|information security|grc|compliance|nist|iso.?27001|pci.?dss|hipaa|firewall|endpoint security|incident response|digital forensic|pentest|penetration test|ddos|botnet|trojan|spyware|dark web|encryption|identity theft|multi.?factor|authentication|privileged access|cloud security|security audit|security assessment|risk assessment|vulnerability assessment|code audit|audit finding|security posture|red team|blue team|purple team|threat model|security compliance|security framework|security operations|security breach|security incident|security flaw|security patch|patch management|security researcher|bug bounty|responsible disclosure|supply chain attack|third party risk)\b/i;

// ─── AI News: 6 focused fetches ───────────────────────────────────────────
export async function fetchAI() {
  const results = await Promise.allSettled([
    apiFetch('artificial intelligence'),
    apiFetch('ChatGPT'),
    apiFetch('OpenAI'),
    apiFetch('machine learning'),
    apiFetch('generative AI'),
    apiFetch('LLM AI'),
  ]);
  const raw      = results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  const articles = process(raw, AI_RE);
  return { status: 'ok', articles };
}

// ─── Cyber + Security Audit News: 8 focused fetches ──────────────────────
export async function fetchCyber() {
  const results = await Promise.allSettled([
    apiFetch('cybersecurity'),
    apiFetch('data breach'),
    apiFetch('ransomware'),
    apiFetch('malware'),
    apiFetch('cyber attack'),
    apiFetch('security audit'),
    apiFetch('vulnerability'),
    apiFetch('hacking'),
  ]);
  const raw      = results.filter(r=>r.status==='fulfilled').flatMap(r=>r.value);
  const articles = process(raw, CY_RE);
  return { status: 'ok', articles };
}

// ─── Search within a section ──────────────────────────────────────────────
export async function searchInSection(query, section) {
  const raw      = await apiFetch(query);
  const filterRe = section === 'ai' ? AI_RE : CY_RE;
  const normed   = raw.filter(a=>a.title).map(norm);
  // For search, don't filter — show all matching the query
  const articles = dedup(normed).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
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
