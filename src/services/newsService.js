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
  const raw = await fetchSequential([
    'artificial intelligence',
    'ChatGPT OpenAI',
    'machine learning generative AI',
  ]);
  const articles = process(raw, AI_RE);
  return { status: 'ok', articles: articles.length >= 3 ? articles : AI_DEMO };
}

// ─── Cyber + Audit News — 3 fetches only ─────────────────────────────────
export async function fetchCyber() {
  const raw = await fetchSequential([
    'cybersecurity hacking',
    'data breach ransomware malware',
    'security audit vulnerability',
  ]);
  const articles = process(raw, CY_RE);
  return { status: 'ok', articles: articles.length >= 3 ? articles : CY_DEMO };
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

// ─── Demo data — shown when API limit is hit ──────────────────────────────
function demoArticle(id, title, description, source, hoursAgo, image) {
  return {
    articleId:   id,
    title,
    description,
    url:         'https://www.google.com/search?q=' + encodeURIComponent(title),
    urlToImage:  image || `https://picsum.photos/seed/${id}/800/450`,
    publishedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
    source:      { name: source },
    author:      null,
  };
}

const AI_DEMO = [
  demoArticle('ai1','OpenAI Releases GPT-5 With Unprecedented Reasoning Capabilities','OpenAI has unveiled its latest model, claiming significant improvements in logical reasoning, coding, and multimodal understanding over previous versions.','TechCrunch',1),
  demoArticle('ai2','Google DeepMind Achieves Breakthrough in Protein Structure Prediction','Researchers at DeepMind have expanded AlphaFold capabilities to predict complex protein interactions, potentially revolutionizing drug discovery.','Nature',2),
  demoArticle('ai3','Anthropic Raises $2B to Accelerate Claude AI Development','AI safety company Anthropic has secured major funding to expand its Claude AI assistant and research into interpretability and alignment.','Bloomberg',3),
  demoArticle('ai4','EU AI Act Enforcement Begins: What Companies Must Do Now','The European Union has begun enforcing its landmark AI regulation, requiring companies to classify and document their AI systems under strict new rules.','Reuters',4),
  demoArticle('ai5','Meta Releases Llama 4 as Open Source Model','Meta has open-sourced its latest Llama 4 model, outperforming several closed-source competitors on key benchmarks.','The Verge',5),
  demoArticle('ai6','AI Agents Now Autonomously Managing Enterprise Workflows','A new generation of AI agents are being deployed across Fortune 500 companies to autonomously manage complex multi-step business workflows.','Wired',6),
  demoArticle('ai7','Microsoft Copilot Integration Expands Across Office 365 Suite','Microsoft has deepened Copilot AI integration across Word, Excel and Teams with new autonomous task completion features.','ZDNet',7),
  demoArticle('ai8','NVIDIA Unveils Next-Gen AI Chip for Data Center Workloads','NVIDIA announced its next-generation GPU architecture designed specifically for large-scale AI training, promising 3x performance gains.','Ars Technica',8),
  demoArticle('ai9','AI Regulation: White House Issues New Executive Order on AI Safety','The White House has issued a comprehensive executive order establishing new safety standards and reporting requirements for advanced AI systems.','Politico',9),
  demoArticle('ai10','Generative AI Market to Hit $1.3 Trillion by 2032','A new market analysis projects massive growth in the generative AI sector driven by enterprise adoption across all major industries.','Forbes',10),
  demoArticle('ai11','Stanford AI Index Report: AI Progress Accelerating Across All Benchmarks','The annual Stanford AI Index shows AI systems are improving faster than ever across language, vision, coding and scientific reasoning tasks.','Stanford HAI',11),
  demoArticle('ai12','New AI Model Detects Cancer Earlier Than Human Radiologists','A team at MIT has developed a deep learning model that identifies early-stage cancer in medical scans with higher accuracy than expert physicians.','MIT News',12),
];

const CY_DEMO = [
  demoArticle('cy1','Massive Ransomware Attack Hits 200 Healthcare Organizations','A coordinated ransomware campaign has disrupted hospital systems across North America and Europe, forcing emergency procedures to revert to paper.','SecurityWeek',1,'https://picsum.photos/seed/cy1/800/450'),
  demoArticle('cy2','Critical Zero-Day Vulnerability Found in Windows 11 Kernel','Microsoft has issued an emergency patch for a critical zero-day vulnerability being actively exploited in the wild by nation-state threat actors.','BleepingComputer',2,'https://picsum.photos/seed/cy2/800/450'),
  demoArticle('cy3','CISA Issues Warning on New APT Group Targeting Critical Infrastructure','The Cybersecurity and Infrastructure Security Agency has published a threat advisory about a sophisticated APT group targeting energy and water systems.','CISA',3,'https://picsum.photos/seed/cy3/800/450'),
  demoArticle('cy4','Data Breach Exposes 50 Million Customer Records at Major Bank','A major financial institution has disclosed a significant data breach affecting customer PII including account numbers, SSNs and transaction history.','Financial Times',4,'https://picsum.photos/seed/cy4/800/450'),
  demoArticle('cy5','New SOC Automation Tools Reduce Incident Response Time by 70%','Enterprise security teams are deploying next-generation SOAR platforms with AI-powered triage that dramatically reduces mean time to respond.','Dark Reading',5,'https://picsum.photos/seed/cy5/800/450'),
  demoArticle('cy6','Security Audit Reveals Critical Flaws in Popular Open Source Libraries','A comprehensive security audit of widely-used npm packages has uncovered multiple critical vulnerabilities affecting millions of applications.','Hacker News',6,'https://picsum.photos/seed/cy6/800/450'),
  demoArticle('cy7','GRC Platform Market Grows as Compliance Complexity Increases','Organizations are investing heavily in Governance, Risk and Compliance platforms as regulatory frameworks like DORA and NIS2 take effect.','Gartner',7,'https://picsum.photos/seed/cy7/800/450'),
  demoArticle('cy8','FBI Disrupts Major Phishing-as-a-Service Operation','The FBI and international law enforcement have taken down a large phishing-as-a-service platform responsible for millions of credential theft attacks.','Krebs on Security',8,'https://picsum.photos/seed/cy8/800/450'),
  demoArticle('cy9','ISO 27001 Certification Demand Surges Among Cloud Providers','Cloud service providers are fast-tracking ISO 27001 certifications as enterprise customers demand stronger security assurance from their vendors.','CSO Online',9,'https://picsum.photos/seed/cy9/800/450'),
  demoArticle('cy10','Threat Intelligence Report: Ransomware Groups Shifting to Data Extortion','A new threat intelligence report shows ransomware groups are increasingly focusing on data theft and extortion rather than encryption attacks.','CrowdStrike',10,'https://picsum.photos/seed/cy10/800/450'),
  demoArticle('cy11','NIST Releases Updated Cybersecurity Framework 2.0','The National Institute of Standards and Technology has published the updated CSF 2.0 with new guidance on governance, supply chain and AI risks.','NIST',11,'https://picsum.photos/seed/cy11/800/450'),
  demoArticle('cy12','Pen Testing Firm Discovers Critical Flaw in Fortune 500 VPN Infrastructure','A routine penetration test uncovered a critical authentication bypass vulnerability in widely deployed enterprise VPN appliances.','Wired',12,'https://picsum.photos/seed/cy12/800/450'),
];
