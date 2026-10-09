import React, { useState } from 'react';
import { formatTimeAgo, formatFullDate } from '../services/newsService.js';
import './IndiaSection.css';

export default function IndiaSection({ articles, loading, onSelect, onRefresh, lastUpdated }) {
  const [imgErrors, setImgErrors] = useState({});

  if (loading && articles.length === 0) {
    return (
      <div className="india-section">
        <IndiaHeader lastUpdated={lastUpdated} onRefresh={onRefresh} />
        <div className="india-grid">
          {Array.from({ length: 6 }).map((_, i) => <IndiaSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="india-section">
        <IndiaHeader lastUpdated={lastUpdated} onRefresh={onRefresh} />
        <div className="india-empty">
          <span>🇮🇳</span>
          <p>No Indian news found right now. Try refreshing.</p>
        </div>
      </div>
    );
  }

  // Top story + rest
  const [top, ...rest] = articles;

  return (
    <div className="india-section">
      <IndiaHeader lastUpdated={lastUpdated} onRefresh={onRefresh} articleCount={articles.length} />

      {/* Top story — full width */}
      <div
        className="india-top-story"
        onClick={() => onSelect(top)}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && onSelect(top)}
      >
        <div className="india-top-image-wrap">
          {top.urlToImage && !imgErrors[0] ? (
            <img
              src={top.urlToImage}
              alt={top.title}
              className="india-top-image"
              onError={() => setImgErrors(p => ({ ...p, 0: true }))}
            />
          ) : (
            <div className="india-top-placeholder">🇮🇳</div>
          )}
          <div className="india-top-overlay" />
        </div>
        <div className="india-top-content">
          <div className="india-top-meta">
            <span className="india-source-badge">{top.source?.name}</span>
            <span className="india-top-time">
              🕐 {formatTimeAgo(top.publishedAt)}
              <span className="india-exact-time"> · {formatFullDate(top.publishedAt)}</span>
            </span>
          </div>
          <h2 className="india-top-title">{top.title}</h2>
          {top.description && <p className="india-top-desc">{top.description}</p>}
          <button className="india-read-btn">
            Read Full Story →
          </button>
        </div>
      </div>

      {/* Rest of articles — timeline list */}
      <div className="india-timeline">
        <h3 className="india-timeline-label">
          <span className="india-dot-live" />
          Latest Updates
        </h3>
        <div className="india-list">
          {rest.map((article, i) => (
            <div
              key={i}
              className="india-list-item"
              onClick={() => onSelect(article)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelect(article)}
            >
              {/* Time column */}
              <div className="india-item-time-col">
                <span className="india-item-ago">{formatTimeAgo(article.publishedAt)}</span>
                <span className="india-item-exact">{formatFullDate(article.publishedAt)}</span>
                <div className="india-timeline-line" />
                <div className="india-timeline-dot" />
              </div>

              {/* Content column */}
              <div className="india-item-content">
                {article.urlToImage && !imgErrors[i + 1] ? (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="india-item-image"
                    onError={() => setImgErrors(p => ({ ...p, [i + 1]: true }))}
                  />
                ) : (
                  <div className="india-item-img-placeholder">📰</div>
                )}
                <div className="india-item-text">
                  <span className="india-item-source">{article.source?.name}</span>
                  <h4 className="india-item-title">{article.title}</h4>
                  {article.description && (
                    <p className="india-item-desc">{article.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndiaHeader({ lastUpdated, onRefresh, articleCount }) {
  return (
    <div className="india-header">
      <div className="india-header-left">
        <span className="india-flag">🇮🇳</span>
        <div>
          <h2 className="india-title">India Today</h2>
          <p className="india-subtitle">Latest news from across India — sorted newest first</p>
        </div>
        <div className="india-live-pill">
          <span className="india-live-dot" />
          LIVE
        </div>
      </div>
      <div className="india-header-right">
        {articleCount > 0 && (
          <span className="india-count">{articleCount} stories</span>
        )}
        {lastUpdated && (
          <span className="india-updated">
            Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <button className="india-refresh-btn" onClick={onRefresh} title="Refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
            <path d="M23 4v6h-6M1 20v-6h6" />
            <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function IndiaSkeleton() {
  return (
    <div className="india-skeleton">
      <div className="sk-img" />
      <div className="sk-body">
        <div className="sk-line" />
        <div className="sk-line short" />
        <div className="sk-meta" />
      </div>
    </div>
  );
}
