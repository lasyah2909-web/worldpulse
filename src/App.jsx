import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import HeroNews from './components/HeroNews.jsx';
import NewsTicker from './components/NewsTicker.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import NewsGrid from './components/NewsGrid.jsx';
import NewsModal from './components/NewsModal.jsx';
import SearchBar from './components/SearchBar.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { fetchTopHeadlines, fetchByCategory, searchNews } from './services/newsService.js';
import './App.css';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
const DEFAULT_API_KEY = '1dc629f61e2a4fffb7b1bbbabf712d3e';

export default function App() {
  const [articles, setArticles] = useState([]);
  const [heroArticles, setHeroArticles] = useState([]);
  const [tickerArticles, setTickerArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('newsApiKey') || DEFAULT_API_KEY);
  const [showApiInput, setShowApiInput] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadNews = useCallback(async (category = 'general', query = '') => {
    if (!apiKey) {
      setIsDemoMode(true);
      setLoading(false);
      loadDemoData();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let data;
      if (query.trim()) {
        data = await searchNews(apiKey, query);
      } else {
        data = await fetchByCategory(apiKey, category);
      }
      const validArticles = data.articles.filter(
        a => a.title && a.title !== '[Removed]' && a.urlToImage
      );
      setArticles(validArticles);
      setHeroArticles(validArticles.slice(0, 5));
      setLastUpdated(new Date());
      setIsDemoMode(false);

      // Load ticker from general always
      if (category !== 'general' || query) {
        const tickerData = await fetchTopHeadlines(apiKey);
        const tickerValid = tickerData.articles.filter(
          a => a.title && a.title !== '[Removed]'
        );
        setTickerArticles(tickerValid.slice(0, 15));
      } else {
        setTickerArticles(validArticles.slice(0, 15));
      }
    } catch (err) {
      console.error(err);
      if (err.message?.includes('426') || err.message?.includes('cors') || err.message?.includes('CORS')) {
        setError('cors');
      } else {
        setError(err.message || 'Failed to fetch news');
      }
      loadDemoData();
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, [apiKey]);

  function loadDemoData() {
    const demo = generateDemoArticles();
    setArticles(demo);
    setHeroArticles(demo.slice(0, 5));
    setTickerArticles(demo.slice(0, 15));
    setLastUpdated(new Date());
  }

  useEffect(() => {
    loadNews(selectedCategory, searchQuery);
  }, [selectedCategory]);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (!searchQuery) loadNews(selectedCategory);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedCategory, searchQuery, loadNews]);

  // Initial load
  useEffect(() => {
    loadNews('general');
  }, [apiKey]);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    if (q.trim()) {
      loadNews(selectedCategory, q);
    } else {
      loadNews(selectedCategory);
    }
  }, [selectedCategory, loadNews]);

  const handleSaveApiKey = (key) => {
    const trimmed = key.trim();
    localStorage.setItem('newsApiKey', trimmed);
    setApiKey(trimmed);
    setShowApiInput(false);
  };

  if (loading && articles.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={() => loadNews(selectedCategory, searchQuery)}
        onApiKeyClick={() => setShowApiInput(true)}
        isDemoMode={isDemoMode}
      />

      {showApiInput && (
        <ApiKeyModal
          currentKey={apiKey}
          onSave={handleSaveApiKey}
          onClose={() => setShowApiInput(false)}
        />
      )}

      {tickerArticles.length > 0 && <NewsTicker articles={tickerArticles} />}

      <main className="main-content">
        {!searchQuery && heroArticles.length > 0 && (
          <HeroNews articles={heroArticles} onSelect={setSelectedArticle} />
        )}

        <section className="news-section">
          <div className="section-header">
            <SearchBar onSearch={handleSearch} value={searchQuery} />
            <CategoryFilter
              selected={selectedCategory}
              onChange={(cat) => {
                setSelectedCategory(cat);
                setSearchQuery('');
              }}
            />
          </div>

          {error && error !== 'cors' && (
            <div className="error-banner">
              <span>⚠️</span>
              <span>{error} — showing demo data</span>
            </div>
          )}

          {isDemoMode && (
            <div className="demo-banner">
              <span>🔑</span>
              <span>
                Showing <strong>demo data</strong>. Add your free{' '}
                <a href="https://newsapi.org/register" target="_blank" rel="noreferrer">
                  NewsAPI.org key
                </a>{' '}
                to get live news.
              </span>
              <button onClick={() => setShowApiInput(true)}>Add API Key</button>
            </div>
          )}

          <NewsGrid
            articles={articles}
            loading={loading}
            onSelect={setSelectedArticle}
          />
        </section>
      </main>

      {selectedArticle && (
        <NewsModal article={selectedArticle} onClose={() => setSelectedArticle(null)} />
      )}
    </div>
  );
}

// Inline API Key Modal
function ApiKeyModal({ currentKey, onSave, onClose }) {
  const [value, setValue] = useState(currentKey);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="api-modal" onClick={e => e.stopPropagation()}>
        <h2>🔑 Enter NewsAPI Key</h2>
        <p>
          Get your free key at{' '}
          <a href="https://newsapi.org/register" target="_blank" rel="noreferrer">
            newsapi.org/register
          </a>
        </p>
        <p className="api-note">
          ⚠️ NewsAPI.org only works from localhost in the free plan. The app works perfectly on localhost!
        </p>
        <input
          type="text"
          placeholder="Paste your API key here..."
          value={value}
          onChange={e => setValue(e.target.value)}
          className="api-input"
          autoFocus
        />
        <div className="api-modal-btns">
          <button className="btn-save" onClick={() => onSave(value)} disabled={!value.trim()}>
            Save & Load News
          </button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Demo data generator
function generateDemoArticles() {
  const categories = [
    { tag: 'Technology', color: '#7c3aed' },
    { tag: 'Politics', color: '#ec4899' },
    { tag: 'Science', color: '#06b6d4' },
    { tag: 'Business', color: '#f97316' },
    { tag: 'Sports', color: '#10b981' },
    { tag: 'Health', color: '#f59e0b' },
    { tag: 'Entertainment', color: '#8b5cf6' },
    { tag: 'World', color: '#ef4444' },
  ];

  const demoData = [
    {
      title: 'AI Surpasses Human Performance in Complex Reasoning Tasks',
      description: 'Researchers at leading AI labs have developed models that consistently outperform humans across a wide range of complex logical and creative reasoning benchmarks.',
      source: { name: 'TechCrunch' },
      publishedAt: new Date(Date.now() - 1800000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/ai1/800/500',
      url: '#',
      category: categories[0],
    },
    {
      title: 'Global Climate Summit Reaches Historic Carbon Agreement',
      description: 'World leaders from over 190 countries have signed a landmark agreement to cut carbon emissions by 60% before 2040, marking the most ambitious climate deal in history.',
      source: { name: 'Reuters' },
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/climate2/800/500',
      url: '#',
      category: categories[7],
    },
    {
      title: 'SpaceX Successfully Launches Crewed Mars Mission',
      description: 'In a historic moment for human spaceflight, SpaceX has launched the first crewed mission bound for Mars, with six astronauts aboard the Starship spacecraft.',
      source: { name: 'Space.com' },
      publishedAt: new Date(Date.now() - 5400000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/space3/800/500',
      url: '#',
      category: categories[2],
    },
    {
      title: 'Federal Reserve Announces Surprise Interest Rate Decision',
      description: 'The Federal Reserve shocked markets with an unexpected announcement regarding interest rates, causing significant volatility across global financial markets.',
      source: { name: 'Bloomberg' },
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/finance4/800/500',
      url: '#',
      category: categories[3],
    },
    {
      title: 'New mRNA Vaccine Shows 95% Efficacy Against Cancer',
      description: 'Clinical trials for a revolutionary personalized mRNA cancer vaccine have shown unprecedented efficacy rates, potentially transforming oncology treatment worldwide.',
      source: { name: 'Nature Medicine' },
      publishedAt: new Date(Date.now() - 9000000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/health5/800/500',
      url: '#',
      category: categories[5],
    },
    {
      title: 'World Cup Final Sets New Global Viewership Record',
      description: 'The FIFA World Cup final attracted over 2.5 billion viewers worldwide, shattering previous records and becoming the most-watched sporting event in history.',
      source: { name: 'ESPN' },
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/sports6/800/500',
      url: '#',
      category: categories[4],
    },
    {
      title: 'Quantum Computing Breakthrough Solves Decades-Old Problem',
      description: 'Scientists using a 1000-qubit quantum computer have solved a cryptographic problem that would have taken classical computers over a billion years to crack.',
      source: { name: 'MIT Tech Review' },
      publishedAt: new Date(Date.now() - 12600000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/quantum7/800/500',
      url: '#',
      category: categories[0],
    },
    {
      title: 'G20 Leaders Agree on Global Minimum Corporate Tax',
      description: 'G20 nations have unanimously agreed to implement a global minimum corporate tax rate, in a move that could reshape international business practices.',
      source: { name: 'Financial Times' },
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/g208/800/500',
      url: '#',
      category: categories[1],
    },
    {
      title: 'Netflix Announces Interactive AI-Driven Storytelling Platform',
      description: 'Netflix has unveiled a revolutionary platform that uses AI to create personalized, interactive storylines that adapt in real-time to viewer choices and emotions.',
      source: { name: 'Variety' },
      publishedAt: new Date(Date.now() - 16200000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/netflix9/800/500',
      url: '#',
      category: categories[6],
    },
    {
      title: 'Scientists Discover Earth-Like Planet in Habitable Zone',
      description: 'Astronomers have confirmed the discovery of a planet remarkably similar to Earth orbiting within the habitable zone of a nearby star just 12 light-years away.',
      source: { name: 'NASA' },
      publishedAt: new Date(Date.now() - 18000000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/planet10/800/500',
      url: '#',
      category: categories[2],
    },
    {
      title: 'Apple Unveils Revolutionary Neural Interface Device',
      description: 'Apple has announced a groundbreaking neural interface device that allows users to control their devices using only thought, promising to redefine human-computer interaction.',
      source: { name: 'The Verge' },
      publishedAt: new Date(Date.now() - 19800000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/apple11/800/500',
      url: '#',
      category: categories[0],
    },
    {
      title: 'Middle East Peace Talks Show Unprecedented Progress',
      description: 'Diplomatic negotiations between longtime rivals in the Middle East have produced a framework agreement that experts are calling the most significant step toward regional peace in decades.',
      source: { name: 'Al Jazeera' },
      publishedAt: new Date(Date.now() - 21600000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/peace12/800/500',
      url: '#',
      category: categories[7],
    },
  ];

  return demoData;
}
