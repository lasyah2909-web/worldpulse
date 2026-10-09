import axios from 'axios';

// GNews API — works from localhost AND deployed sites (no domain restriction)
// Free plan: 100 requests/day, 10 articles per request
// Docs: https://docs.gnews.io/

const BASE_URL = 'https://gnews.io/api/v4';
const API_KEY = '3948b34867317d54e1af49ea41d5cac1';

// GNews category mapping
const GNEWS_CATEGORIES = {
  general:       'general',
  technology:    'technology',
  business:      'business',
  science:       'science',
  health:        'health',
  sports:        'sports',
  entertainment: 'entertainment',
};

export async function fetchTopHeadlines(category = 'general') {
  const response = await axios.get(`${BASE_URL}/top-headlines`, {
    params: {
      category: GNEWS_CATEGORIES[category] || 'general',
      lang: 'en',
      max: 10,
      apikey: API_KEY,
    },
  });
  if (!response.data.articles) {
    throw new Error('No articles returned from GNews');
  }
  // Normalize to match our app's expected shape
  return {
    status: 'ok',
    articles: response.data.articles.map(normalizeArticle),
  };
}

export async function fetchByCategory(category = 'general') {
  return fetchTopHeadlines(category);
}

export async function searchNews(query) {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: {
      q: query,
      lang: 'en',
      max: 10,
      sortby: 'publishedAt',
      apikey: API_KEY,
    },
  });
  if (!response.data.articles) {
    throw new Error('No articles returned from GNews');
  }
  return {
    status: 'ok',
    articles: response.data.articles.map(normalizeArticle),
  };
}

// Normalize GNews article shape to match what our components expect
function normalizeArticle(article) {
  return {
    title: article.title,
    description: article.description,
    content: article.content,
    url: article.url,
    urlToImage: article.image,
    publishedAt: article.publishedAt,
    source: { name: article.source?.name || 'GNews' },
    author: article.source?.name || null,
  };
}

export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

export const CATEGORIES = [
  { id: 'general',       label: 'Top Stories',    emoji: '🌍', color: '#7c3aed' },
  { id: 'technology',    label: 'Tech',           emoji: '💻', color: '#06b6d4' },
  { id: 'business',      label: 'Business',       emoji: '📈', color: '#f97316' },
  { id: 'science',       label: 'Science',        emoji: '🔬', color: '#10b981' },
  { id: 'health',        label: 'Health',         emoji: '💊', color: '#f59e0b' },
  { id: 'sports',        label: 'Sports',         emoji: '⚽', color: '#ec4899' },
  { id: 'entertainment', label: 'Entertainment',  emoji: '🎬', color: '#8b5cf6' },
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
