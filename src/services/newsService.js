import axios from 'axios';

// In development (localhost), we can call NewsAPI directly.
// In production (Vercel), we call our serverless proxy at /api/news
// which keeps the API key secret and bypasses the free-plan domain restriction.

const IS_DEV = import.meta.env.DEV;
const DIRECT_URL = 'https://newsapi.org/v2';
const PROXY_URL = '/api/news';

async function callApi(endpoint, params, apiKey) {
  if (IS_DEV && apiKey) {
    // Direct call from localhost — free plan allows this
    const response = await axios.get(`${DIRECT_URL}/${endpoint}`, {
      params: { ...params, apiKey },
    });
    if (response.data.status !== 'ok') {
      throw new Error(response.data.message || 'NewsAPI error');
    }
    return response.data;
  } else {
    // Production: go through our Vercel serverless proxy
    const response = await axios.get(PROXY_URL, {
      params: { endpoint, ...params },
    });
    if (response.data.status !== 'ok') {
      throw new Error(response.data.message || 'NewsAPI error');
    }
    return response.data;
  }
}

export async function fetchTopHeadlines(apiKey, country = 'us') {
  return callApi('top-headlines', { country, pageSize: 30 }, apiKey);
}

export async function fetchByCategory(apiKey, category = 'general', country = 'us') {
  const params = { country, pageSize: 30 };
  if (category && category !== 'general') {
    params.category = category;
  }
  return callApi('top-headlines', params, apiKey);
}

export async function searchNews(apiKey, query, pageSize = 30) {
  return callApi('everything', {
    q: query,
    pageSize,
    sortBy: 'publishedAt',
    language: 'en',
  }, apiKey);
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
