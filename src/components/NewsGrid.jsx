import React from 'react';
import NewsCard from './NewsCard.jsx';
import './NewsGrid.css';

export default function NewsGrid({ articles, loading, onSelect }) {
  if (loading && articles.length === 0) {
    return (
      <div className="news-grid">
        {Array.from({ length: 9 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!loading && articles.length === 0) {
    return (
      <div className="news-empty">
        <span className="empty-icon">🔍</span>
        <h3>No articles found</h3>
        <p>Try a different search term or category</p>
      </div>
    );
  }

  return (
    <div className={`news-grid ${loading ? 'loading' : ''}`}>
      {articles.map((article, i) => (
        <NewsCard
          key={`${article.url}-${i}`}
          article={article}
          onSelect={onSelect}
          index={i}
          featured={i === 0}
        />
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton-tag" />
        <div className="skeleton-title" />
        <div className="skeleton-title short" />
        <div className="skeleton-meta" />
      </div>
    </div>
  );
}
