import React from 'react';
import NewsGrid from './NewsGrid.jsx';
import './IndiaSection.css';

export default function IndiaSection({ articles, loading, onSelect, onRefresh, lastUpdated }) {
  return (
    <div className="india-section">
      {/* Header */}
      <div className="india-header">
        <div className="india-header-left">
          <span className="india-flag-emoji">🇮🇳</span>
          <div>
            <h2 className="india-title">India Today</h2>
            <p className="india-subtitle">Latest news from Indian sources — newest first</p>
          </div>
          <div className="india-live-pill">
            <span className="india-live-dot" />
            LIVE
          </div>
        </div>

        <div className="india-header-right">
          {articles.length > 0 && (
            <span className="india-count">{articles.length} stories</span>
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

      {/* Same news grid as every other category */}
      <NewsGrid
        articles={articles}
        loading={loading}
        onSelect={onSelect}
      />
    </div>
  );
}
