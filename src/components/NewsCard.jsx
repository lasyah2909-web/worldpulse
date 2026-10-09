import React, { useState } from 'react';
import { formatTimeAgo, formatFullDate, CATEGORY_COLORS } from '../services/newsService.js';
import './NewsCard.css';

const FALLBACK_COLORS = [
  '#7c3aed', '#ec4899', '#06b6d4',
  '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ff6b00',
];

export default function NewsCard({ article, onSelect, index, featured }) {
  const [imgError, setImgError] = useState(false);
  const accentColor = FALLBACK_COLORS[index % FALLBACK_COLORS.length];
  const handleClick = () => onSelect(article);

  // Country flag emoji
  const countryFlag = article.country ? getFlag(article.country) : '';

  return (
    <article
      className={`news-card ${featured ? 'featured' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      style={{ '--accent': accentColor, animationDelay: `${index * 40}ms` }}
    >
      {/* Image */}
      <div className="card-image-wrap">
        {article.urlToImage && !imgError ? (
          <img
            src={article.urlToImage}
            alt={article.title}
            className="card-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="card-image-placeholder" style={{ background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}11)` }}>
            <span className="placeholder-icon">📰</span>
          </div>
        )}
        <div className="card-image-tint" />

        {/* Source badge */}
        <div className="card-source-badge">
          {countryFlag} {article.source?.name || 'News'}
        </div>

        {featured && (
          <div className="card-featured-label">⭐ Featured</div>
        )}
      </div>

      {/* Body */}
      <div className="card-body">
        <h2 className="card-title">{article.title}</h2>

        {article.description && (
          <p className="card-description">{article.description}</p>
        )}

        <div className="card-footer">
          <div className="card-meta">
            {/* Relative time with full timestamp on hover */}
            <span
              className="card-time"
              title={formatFullDate(article.publishedAt)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {formatTimeAgo(article.publishedAt)}
            </span>
            {/* Full date always visible */}
            <span className="card-fulldate">
              {formatFullDate(article.publishedAt)}
            </span>
          </div>
          <button className="card-read-btn" onClick={e => { e.stopPropagation(); onSelect(article); }}>
            Read
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Hover accent line */}
      <div className="card-accent-line" />
    </article>
  );
}

// Country code → flag emoji
function getFlag(countryCode) {
  if (!countryCode) return '';
  const code = countryCode.toUpperCase();
  try {
    return code.split('').map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('');
  } catch {
    return '';
  }
}
