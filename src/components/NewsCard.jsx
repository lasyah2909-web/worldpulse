import React, { useState } from 'react';
import { formatTimeAgo, formatFullDate } from '../services/newsService.js';
import './NewsCard.css';

const ACCENT_COLORS = [
  '#7c3aed', '#ec4899', '#06b6d4',
  '#f97316', '#10b981', '#f59e0b', '#8b5cf6', '#ff6b00',
];

// Readable gradient backgrounds for when image fails/missing
const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(135deg, #1a0a2e, #2d1b4e)',
  'linear-gradient(135deg, #0f1a2e, #1a2d4e)',
  'linear-gradient(135deg, #0a1f1a, #1a3d2e)',
  'linear-gradient(135deg, #1f0a0a, #3d1a1a)',
  'linear-gradient(135deg, #1a1a0a, #2e2d1a)',
  'linear-gradient(135deg, #0f0f1f, #1a1a3d)',
  'linear-gradient(135deg, #1f0a1a, #3d1a2e)',
  'linear-gradient(135deg, #0a1f1f, #1a3d3d)',
];

export default function NewsCard({ article, onSelect, index, featured }) {
  const [imgError, setImgError] = useState(false);
  const accent      = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const placeholder = PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length];
  const handleClick = () => onSelect(article);

  // Pick first letter of source for placeholder
  const sourceInitial = (article.source?.name || 'N')[0].toUpperCase();

  return (
    <article
      className={`news-card ${featured ? 'featured' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      style={{ '--accent': accent, animationDelay: `${index * 40}ms` }}
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
          <div className="card-image-placeholder" style={{ background: placeholder }}>
            <div className="placeholder-letter" style={{ color: accent }}>{sourceInitial}</div>
            <div className="placeholder-source">{article.source?.name}</div>
          </div>
        )}
        <div className="card-image-tint" />

        {/* Source badge */}
        <div className="card-source-badge">{article.source?.name || 'News'}</div>

        {featured && <div className="card-featured-label">⭐ Featured</div>}
      </div>

      {/* Body */}
      <div className="card-body">
        <h2 className="card-title">{article.title}</h2>

        {article.description && (
          <p className="card-description">{article.description}</p>
        )}

        <div className="card-footer">
          <div className="card-meta">
            <span className="card-time" title={formatFullDate(article.publishedAt)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {formatTimeAgo(article.publishedAt)}
            </span>
            <span className="card-fulldate">{formatFullDate(article.publishedAt)}</span>
          </div>
          <button className="card-read-btn" onClick={e => { e.stopPropagation(); onSelect(article); }}>
            Read
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="card-accent-line" />
    </article>
  );
}
