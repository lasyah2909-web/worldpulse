import axios from 'axios';

// NewsData.io supports CORS — works directly from browser on ANY domain
// No proxy needed, no serverless function needed
const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1/latest';

async function apiFetch(params) {
  const res = await axios.get(BASE, {
    params: { ...params, apikey: API_KEY },
  });
  return res.data;
}

function dedup(articles) {
  const seen = new Set();
  return articles.filter(a => {
    const key = a.title?.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const CATEGORY_MAP = {
  general:       'top',
  technology:    'technology',
  business:      'business',
  science:       'science',
  health:        'health',
  sports:        'sports',
  entertainment: 'entertainment',
};

export async function fetchByCategory(category = 'general') {
  const isIndia = category === 'india';

  const params = { language: 'en', size: 10 };

  if (isIndia) {
    params.country = 'in';
  } else {
    params.category = CATEGORY_MAP[category] || 'top';
  }

  const data = await apiFetch(params);

  if (data.status !== 'success') {
    throw new Error(data.results?.message || 'Failed to fetch news');
  }

  let articles = data.results.filter(a => a.title).map(normalizeArticle);
  articles = dedup(articles);
  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  return { status: 'ok', articles };
}

export async function fetchTopHeadlines() {
  return fetchByCategory('general');
}

export async function searchNews(query) {
  const data = await apiFetch({ language: 'en', q: query, size: 10 });

  if (data.status !== 'success') {
    throw new Error(data.results?.message || 'Search failed');
  }

  let articles = data.results.filter(a => a.title).map(normalizeArticle);
  articles = dedup(articles);

  return { status: 'ok', articles };
}

function normalizeArticle(a) {
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

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export function formatFullDate(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

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
