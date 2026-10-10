import React, { useState, useEffect, useCallback } from 'react';
import Header       from './components/Header.jsx';
import Ticker       from './components/Ticker.jsx';
import SectionTabs  from './components/SectionTabs.jsx';
import NewsSection  from './components/NewsSection.jsx';
import ArticleModal from './components/ArticleModal.jsx';
import Loader       from './components/Loader.jsx';
import { fetchAI, fetchCyber } from './services/newsService.js';
import './App.css';

const REFRESH = 30 * 60 * 1000; // 30 minutes — preserve rate limit (200 req/day)

export default function App() {
  const [tab,         setTab]         = useState('ai');      // 'ai' | 'cyber'
  const [aiArticles,  setAiArticles]  = useState([]);
  const [cyArticles,  setCyArticles]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [selected,    setSelected]    = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [booted,      setBooted]      = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ai, cy] = await Promise.all([fetchAI(), fetchCyber()]);
      setAiArticles(ai.articles);
      setCyArticles(cy.articles);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setBooted(true);
    }
  }, []);

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const t = setInterval(load, REFRESH);
    return () => clearInterval(t);
  }, [load]);

  if (!booted) return <Loader />;

  const tickerItems = [...aiArticles.slice(0,8), ...cyArticles.slice(0,8)];

  return (
    <div className="app">
      <Header lastUpdated={lastUpdated} onRefresh={load} loading={loading} />
      {tickerItems.length > 0 && <Ticker items={tickerItems} />}

      <main className="main">
        <SectionTabs active={tab} onChange={setTab} />

        {error && (
          <div className="error-bar">
            ⚠️ {error} — pull to refresh or check your connection.
          </div>
        )}

        <NewsSection
          section={tab}
          articles={tab === 'ai' ? aiArticles : cyArticles}
          loading={loading}
          onSelect={setSelected}
        />
      </main>

      {selected && <ArticleModal article={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
