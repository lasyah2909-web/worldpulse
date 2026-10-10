import React, { useState } from 'react';
import NewsCard  from './NewsCard.jsx';
import HeroCard  from './HeroCard.jsx';
import SearchBar from './SearchBar.jsx';
import './NewsSection.css';
import { searchInSection } from '../services/newsService.js';

export default function NewsSection({ section, articles, loading, onSelect }) {
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState(null);
  const [srchLoad,setSrchLoad] = useState(false);

  const isAI    = section === 'ai';
  const color   = isAI ? 'var(--ai)' : 'var(--cy)';
  const label   = isAI ? 'AI' : 'Cybersecurity';
  const icon    = isAI ? '🤖' : '🛡️';

  const handleSearch = async (q) => {
    setQuery(q);
    if (!q.trim()) { setResults(null); return; }
    setSrchLoad(true);
    try {
      const d = await searchInSection(q, section);
      setResults(d.articles);
    } catch { setResults([]); }
    finally { setSrchLoad(false); }
  };

  const display = results ?? articles;

  if (loading && !display.length) {
    return (
      <div className="ns">
        <SearchBar onSearch={handleSearch} color={color} placeholder={`Search ${label} news...`} />
        <div className="ns-grid">
          {Array.from({length:9}).map((_,i)=><SkeletonCard key={i}/>)}
        </div>
      </div>
    );
  }

  const [hero, ...rest] = display;

  return (
    <div className="ns">
      <div className="ns-topbar">
        <div className="ns-meta">
          <span className="ns-icon">{icon}</span>
          <div>
            <span className="ns-count" style={{color}}>
              {display.length} stories
            </span>
            <span className="ns-label"> · Latest {label} News</span>
          </div>
        </div>
        <SearchBar onSearch={handleSearch} color={color} placeholder={`Search ${label}...`} />
      </div>

      {!display.length ? (
        <div className="ns-empty">
          <span>{icon}</span>
          <p>No articles found. Try a different search.</p>
        </div>
      ) : (
        <>
          {/* Hero — first article full width */}
          {hero && !query && (
            <HeroCard article={hero} onSelect={onSelect} section={section} />
          )}

          {/* Grid */}
          <div className={`ns-grid ${loading || srchLoad ? 'faded' : ''}`}>
            {(query ? display : rest).map((a, i) => (
              <NewsCard key={a.articleId || i} article={a} index={i} onSelect={onSelect} section={section} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="sk-card">
      <div className="sk-img"/>
      <div className="sk-body">
        <div className="sk-line"/>
        <div className="sk-line s"/>
        <div className="sk-meta"/>
      </div>
    </div>
  );
}
