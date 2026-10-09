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
// Three-level dedup:
// 1. Exact article_id match
// 2. Normalised title match (first 60 chars, no punctuation)
// 3. URL domain + first 6 words match (catches same story different headline)
function dedup(articles) {
  const seenIds    = new Set();
  const seenTitles = new Set();
  const seenSlugs  = new Set();

  return articles.filter(a => {
    if (!a.title) return false;

    // Level 1 — article ID
    if (a.articleId && seenIds.has(a.articleId)) return false;
    if (a.articleId) seenIds.add(a.articleId);

    // Level 2 — normalised title (first 60 chars)
    const titleKey = a.title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 60);
    if (seenTitles.has(titleKey)) return false;
    seenTitles.add(titleKey);

    // Level 3 — first 5 words slug (catches "Teen hopes to break long drought..." × 3 sources)
    const words = titleKey.split(' ').slice(0, 5).join('-');
    if (words.length > 10 && seenSlugs.has(words)) return false;
    seenSlugs.add(words);

    return true;
  });
}

// ─── Fill missing images with a reliable placeholder ─────────────────────────
function fillImage(article, index) {
  if (article.urlToImage) return article;
  // Use a deterministic but varied placeholder based on title hash
  const seed = Math.abs(
    article.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), index * 31)
  ) % 1000;
  return {
    ...article,
    urlToImage: `https://picsum.photos/seed/${seed}/800/500`,
  };
}

// ─── Normalise ────────────────────────────────────────────────────────────────
function normalize(a) {
  return {
    articleId:   a.article_id,
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

function process(raw) {
  const articles = sortNewest(dedup(raw.map(normalize)));
  return articles.map(fillImage);
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

// ─── General category fetch ───────────────────────────────────────────────────
export async function fetchByCategory(category = 'general') {
  if (category === 'india') return fetchIndiaNews();

  const raw = await apiFetch({
    language: 'en',
    category: CATEGORY_MAP[category] || 'top',
    size:     10,
  });

  return { status: 'ok', articles: process(raw) };
}

export async function fetchTopHeadlines() {
  return fetchByCategory('general');
}

// ─── India: 7 parallel fetches ────────────────────────────────────────────────
async function fetchIndiaNews() {
  const calls = [
    apiFetch({ country: 'in', language: 'en', size: 10 }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'top' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'politics' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'sports' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'business' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'entertainment' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'technology' }),
    apiFetch({ country: 'in', language: 'en', size: 10, category: 'health' }),
  ];

  const results = await Promise.allSettled(calls);
  const raw = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value)
    .filter(a => a.title);

  return { status: 'ok', articles: process(raw) };
}

// ─── Search ───────────────────────────────────────────────────────────────────
export async function searchNews(query) {
  const raw = await apiFetch({ language: 'en', q: query, size: 10 });
  return { status: 'ok', articles: process(raw) };
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
