import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header.jsx';
import HeroNews from './components/HeroNews.jsx';
import NewsTicker from './components/NewsTicker.jsx';
import CategoryFilter from './components/CategoryFilter.jsx';
import NewsGrid from './components/NewsGrid.jsx';
import NewsModal from './components/NewsModal.jsx';
import SearchBar from './components/SearchBar.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { fetchByCategory, searchNews } from './services/newsService.js';
import './App.css';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

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
  const [isDemoMode, setIsDemoMode] = useState(false);

  const loadNews = useCallback(async (category = 'general', query = '') => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (query.trim()) {
        data = await searchNews(query);
      } else {
        data = await fetchByCategory(category);
      }

      const validArticles = data.articles.filter(
        a => a.title && a.title !== '[Removed]'
      );

      setArticles(validArticles);
      setHeroArticles(validArticles.slice(0, 5));
      setTickerArticles(validArticles.slice(0, 10));
      setLastUpdated(new Date());
      setIsDemoMode(false);
    } catch (err) {
      console.error('News fetch error:', err);
      setError(err.message || 'Failed to fetch news');
      loadDemoData();
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  function loadDemoData() {
    const demo = generateDemoArticles();
    setArticles(demo);
    setHeroArticles(demo.slice(0, 5));
    setTickerArticles(demo.slice(0, 10));
    setLastUpdated(new Date());
  }

  // Load on category change
  useEffect(() => {
    loadNews(selectedCategory, searchQuery);
  }, [selectedCategory]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!searchQuery) loadNews(selectedCategory);
    }, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [selectedCategory, searchQuery, loadNews]);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    if (q.trim()) {
      loadNews(selectedCategory, q);
    } else {
      loadNews(selectedCategory);
    }
  }, [selectedCategory, loadNews]);

  if (loading && articles.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <div className="app">
      <Header
        lastUpdated={lastUpdated}
        onRefresh={() => loadNews(selectedCategory, searchQuery)}
        isDemoMode={isDemoMode}
      />

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

          {isDemoMode && (
            <div className="demo-banner">
              <span>⚠️</span>
              <span>
                Could not load live news — showing demo data.
                {error && <> ({error})</>}
              </span>
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

// Demo data fallback
function generateDemoArticles() {
  const demoData = [
    {
      title: 'AI Surpasses Human Performance in Complex Reasoning Tasks',
      description: 'Researchers at leading AI labs have developed models that consistently outperform humans across a wide range of complex logical and creative reasoning benchmarks.',
      source: { name: 'TechCrunch' },
      publishedAt: new Date(Date.now() - 1800000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/ai1/800/500',
      url: '#',
    },
    {
      title: 'Global Climate Summit Reaches Historic Carbon Agreement',
      description: 'World leaders from over 190 countries have signed a landmark agreement to cut carbon emissions by 60% before 2040, marking the most ambitious climate deal in history.',
      source: { name: 'Reuters' },
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/climate2/800/500',
      url: '#',
    },
    {
      title: 'SpaceX Successfully Launches Crewed Mars Mission',
      description: 'In a historic moment for human spaceflight, SpaceX has launched the first crewed mission bound for Mars, with six astronauts aboard the Starship spacecraft.',
      source: { name: 'Space.com' },
      publishedAt: new Date(Date.now() - 5400000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/space3/800/500',
      url: '#',
    },
    {
      title: 'Federal Reserve Announces Surprise Interest Rate Decision',
      description: 'The Federal Reserve shocked markets with an unexpected announcement regarding interest rates, causing significant volatility across global financial markets.',
      source: { name: 'Bloomberg' },
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/finance4/800/500',
      url: '#',
    },
    {
      title: 'New mRNA Vaccine Shows 95% Efficacy Against Cancer',
      description: 'Clinical trials for a revolutionary personalized mRNA cancer vaccine have shown unprecedented efficacy rates, potentially transforming oncology treatment worldwide.',
      source: { name: 'Nature Medicine' },
      publishedAt: new Date(Date.now() - 9000000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/health5/800/500',
      url: '#',
    },
    {
      title: 'World Cup Final Sets New Global Viewership Record',
      description: 'The FIFA World Cup final attracted over 2.5 billion viewers worldwide, shattering previous records and becoming the most-watched sporting event in history.',
      source: { name: 'ESPN' },
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/sports6/800/500',
      url: '#',
    },
    {
      title: 'Quantum Computing Breakthrough Solves Decades-Old Problem',
      description: 'Scientists using a 1000-qubit quantum computer have solved a cryptographic problem that would have taken classical computers over a billion years to crack.',
      source: { name: 'MIT Tech Review' },
      publishedAt: new Date(Date.now() - 12600000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/quantum7/800/500',
      url: '#',
    },
    {
      title: 'Apple Unveils Revolutionary Neural Interface Device',
      description: 'Apple has announced a groundbreaking neural interface device that allows users to control their devices using only thought, promising to redefine human-computer interaction.',
      source: { name: 'The Verge' },
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      urlToImage: 'https://picsum.photos/seed/apple8/800/500',
      url: '#',
    },
  ];
  return demoData;
}
