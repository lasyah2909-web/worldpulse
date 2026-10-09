import axios from 'axios';

const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1/latest';

// ─── Core fetch ───────────────────────────────────────────────────────────────
async function apiFetch(params) {
  const res = await axios.get(BASE, {
    params: { ...params, apikey: API_KEY },
    timeout: 10000,
  });
  if (res.data.status !== 'success') {
    throw new Error(res.data.results?.message || 'API error');
  }
  return res.data.results || [];
}

// ─── Deduplication ────────────────────────────────────────────────────────────
// Dedup by title similarity — catches "Same headline from 3 sources" problem
function dedup(articles) {
  const seen = new Set();
  return articles.filter(a => {
    if (!a.title) return false;
    // Normalise: lowercase, strip punctuation, collapse spaces
    const key = a.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ─── Normalise ────────────────────────────────────────────────────────────────
function normalize(a) {
  return {
    title:       a.title,
    description: a.description || '',
    content:     a.content || a.description || '',
    url:         a.link,
    urlToImage:  a.image_url || null,
    publishedAt: a.pubDate,
    source:      { name: a.source_name || a.source_id || 'News' },
    author:      a.creator?.[0] || null,
    country:     a.country?.[0] || '',
  };
}

function sortNewest(articles) {
  return [...articles].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

// ─── Category map ─────────────────────────────────────────────────────────────
const CATEGORY_MAP = {
  general:       'top',
  technology:    'technology',
  business:      'business',
  science:       'science',
  health:        'health',
  sports:        'sports',
  entertainment: 'entertainment',
};

// ─── Main fetch ───────────────────────────────────────────────────────────────
export async function fetchByCategory(category = 'general') {
  if (category === 'india') {
    return fetchIndiaNews();
  }

  const raw = await apiFetch({
    language: 'en',
    category: CATEGORY_MAP[category] || 'top',
    size:     10,
  });

  const articles = sortNewest(dedup(raw.map(normalize)));
  return { status: 'ok', articles };
}

export async function fetchTopHeadlines() {
  return fetchByCategory('general');
}

// ─── India: fetch multiple categories in parallel ─────────────────────────────
async function fetchIndiaNews() {
  // Fetch top Indian news + specific categories simultaneously
  const fetches = [
    apiFetch({ country: 'in', language: 'en', size: 10 }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'top' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'politics' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'sports' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'business' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'entertainment' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'technology' }),
  ];

  // Run all in parallel, ignore individual failures
  const results = await Promise.allSettled(fetches);

  const all = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .map(normalize)
    .filter(a => a.title);

  const articles = sortNewest(dedup(all));

  return { status: 'ok', articles };
}

// ─── Search ───────────────────────────────────────────────────────────────────
export async function searchNews(query) {
  const raw = await apiFetch({ language: 'en', q: query, size: 10 });
  const articles = dedup(raw.map(normalize));
  return { status: 'ok', articles };
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const diff = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateString).toLocaleDateString();
}

export function formatFullDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────
export const CATEGORIES = [
  { id: 'general',       label: 'Top Stories',   emoji: '🌍', color: '#7c3aed' },
  { id: 'india',         label: 'India',         emoji: '🇮🇳', color: '#ff6b00' },
  { id: 'technology',    label: 'Tech',          emoji: '💻', color: '#06b6d4' },
  { id: 'business',      label: 'Business',      emoji: '📈', color: '#f97316' },
  { id: 'science',       label: 'Science',       emoji: '🔬', color: '#10b981' },
  { id: 'health',        label: 'Health',        emoji: '💊', color: '#f59e0b' },
  { id: 'sports',        label: 'Sports',        emoji: '⚽', color: '#ec4899' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#8b5cf6' },
];

export const CATEGORY_COLORS = {
  general:       '#7c3aed',
  india:         '#ff6b00',
  technology:    '#06b6d4',
  business:      '#f97316',
  science:       '#10b981',
  health:        '#f59e0b',
  sports:        '#ec4899',
  entertainment: '#8b5cf6',
};
