import axios from 'axios';

// NewsData.io — works directly from browser, no CORS issues
// Free: 200 requests/day, 10 articles/request, 100,000+ sources, 206 countries
// Works on localhost AND any deployed site — no proxy needed!
const API_KEY = 'pub_c590ab86373e450eb95c3816460caf52';
const BASE    = 'https://newsdata.io/api/1';

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
  const cat = CATEGORY_MAP[category] || 'top';
  const response = await axios.get(`${BASE}/latest`, {
    params: {
      apikey:   API_KEY,
      language: 'en',
      category: cat,
      size:     10,
    },
  });
  if (response.data.status !== 'success') {
    throw new Error(response.data.results?.message || 'Failed to fetch news');
  }
  return {
    status:   'ok',
    articles: response.data.results
      .filter(a => a.title && a.image_url)
      .map(normalizeArticle),
  };
}

export async function fetchTopHeadlines() {
  return fetchByCategory('general');
}

export async function searchNews(query) {
  const response = await axios.get(`${BASE}/latest`, {
    params: {
      apikey:   API_KEY,
      language: 'en',
      q:        query,
      size:     10,
    },
  });
  if (response.data.status !== 'success') {
    throw new Error(response.data.results?.message || 'Search failed');
  }
  return {
    status:   'ok',
    articles: response.data.results
      .filter(a => a.title)
      .map(normalizeArticle),
  };
}

function normalizeArticle(a) {
  return {
    title:       a.title,
    description: a.description || '',
    content:     a.content || a.description || '',
    url:         a.link,
    urlToImage:  a.image_url || `https://picsum.photos/seed/${encodeURIComponent(a.title?.slice(0,10) || 'news')}/800/500`,
    publishedAt: a.pubDate,
    source:      { name: a.source_id || a.source_name || 'News' },
    author:      a.creator?.[0] || null,
    country:     a.country?.[0] || '',
    category:    a.category?.[0] || '',
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

export const CATEGORIES = [
  { id: 'general',       label: 'Top Stories',   emoji: '🌍', color: '#7c3aed' },
  { id: 'technology',    label: 'Tech',          emoji: '💻', color: '#06b6d4' },
  { id: 'business',      label: 'Business',      emoji: '📈', color: '#f97316' },
  { id: 'science',       label: 'Science',       emoji: '🔬', color: '#10b981' },
  { id: 'health',        label: 'Health',        emoji: '💊', color: '#f59e0b' },
  { id: 'sports',        label: 'Sports',        emoji: '⚽', color: '#ec4899' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#8b5cf6' },
];

export const CATEGORY_COLORS = {
  general:       '#7c3aed',
  technology:    '#06b6d4',
  business:      '#f97316',
  science:       '#10b981',
  health:        '#f59e0b',
  sports:        '#ec4899',
  entertainment: '#8b5cf6',
};
