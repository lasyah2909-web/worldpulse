import React, { useState, useEffect } from 'react';
import { formatTimeAgo } from '../services/newsService.js';
import './HeroNews.css';

export default function HeroNews({ articles, onSelect }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(i => (i + 1) % Math.min(articles.length, 5));
    }, 6000);
    return () => clearInterval(timer);
  }, [articles.length]);

  if (!articles.length) return null;

  const main = articles[activeIdx];
  const thumbnails = articles.slice(0, 5);

  return (
    <section className="hero-section">
      <div className="hero-label">
        <span className="hero-label-dot" />
        Top Stories
      </div>

      <div className="hero-grid">
        {/* Main Feature */}
        <div
          className="hero-main"
          onClick={() => onSelect(main)}
          role="button"
          tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && onSelect(main)}
        >
          <div className="hero-image-wrap">
            <img
              src={main.urlToImage}
              alt={main.title}
              className="hero-image"
              onError={e => {
                e.target.src = `https://picsum.photos/seed/${activeIdx}/1200/700`;
              }}
            />
            <div className="hero-image-overlay" />
          </div>

          <div className="hero-content">
            <div className="hero-meta">
              <span className="hero-source">{main.source?.name}</span>
              <span className="hero-time">{formatTimeAgo(main.publishedAt)}</span>
            </div>
            <h1 className="hero-title">{main.title}</h1>
            {main.description && (
              <p className="hero-description">{main.description}</p>
            )}
            <button className="hero-btn">
              Read Full Story
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Dot indicators */}
          <div className="hero-dots">
            {thumbnails.map((_, i) => (
              <button
                key={i}
                className={`hero-dot ${i === activeIdx ? 'active' : ''}`}
                onClick={e => { e.stopPropagation(); setActiveIdx(i); }}
                aria-label={`Story ${i + 1}`}
              />
            ))}
          </div>

          {/* Progress bar */}
          <div className="hero-progress">
            <div key={activeIdx} className="hero-progress-bar" />
          </div>
        </div>

        {/* Side Thumbnails */}
        <div className="hero-side">
          {thumbnails.map((article, i) => (
            <div
              key={i}
              className={`hero-thumb ${i === activeIdx ? 'active' : ''}`}
              onClick={() => { setActiveIdx(i); onSelect(article); }}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(article)}
            >
              <div className="thumb-image-wrap">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="thumb-image"
                  onError={e => {
                    e.target.src = `https://picsum.photos/seed/side${i}/200/120`;
                  }}
                />
              </div>
              <div className="thumb-content">
                <span className="thumb-source">{article.source?.name}</span>
                <p className="thumb-title">{article.title}</p>
                <span className="thumb-time">{formatTimeAgo(article.publishedAt)}</span>
              </div>
              {i === activeIdx && <div className="thumb-active-bar" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
