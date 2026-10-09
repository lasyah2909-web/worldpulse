import axios from 'axios';

// GNews API key
const API_KEY = '3948b34867317d54e1af49ea41d5cac1';

// In dev: requests go to /gnews/... which Vite proxies to https://gnews.io/...
// In prod (Vercel): requests go to /gnews/... which the vercel.json rewrites to gnews.io
// This avoids CORS errors in both environments
const BASE = '/gnews/api/v4';

const GNEWS_CATEGORIES = {
  general:       'general',
  technology:    'technology',
  business:      'business',
  science:       'science',
  health:        'health',
  sports:        'sports',
  entertainment: 'entertainment',
};

async function get(endpoint, params) {
  const response = await axios.get(`${BASE}/${endpoint}`, {
    params: { ...params, apikey: API_KEY },
  });
  if (!response.data || !response.data.articles) {
    throw new Error('Invalid response from news API');
  }
  return {
    status: 'ok',
    articles: response.data.articles.map(normalizeArticle),
  };
}

export async function fetchTopHeadlines(category = 'general') {
  return get('top-headlines', {
    category: GNEWS_CATEGORIES[category] || 'general',
    lang: 'en',
    max: 10,
  });
}

export async function fetchByCategory(category = 'general') {
  return fetchTopHeadlines(category);
}

export async function searchNews(query) {
  return get('search', {
    q: query,
    lang: 'en',
    max: 10,
    sortby: 'publishedAt',
  });
}

function normalizeArticle(a) {
  return {
    title:       a.title,
    description: a.description,
    content:     a.content,
    url:         a.url,
    urlToImage:  a.image,
    publishedAt: a.publishedAt,
    source:      { name: a.source?.name || 'News' },
    author:      a.source?.name || null,
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
