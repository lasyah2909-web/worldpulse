import React, { useEffect } from 'react';
import { formatTimeAgo, formatFullDate } from '../services/newsService.js';
import './NewsModal.css';

export default function NewsModal({ article, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  if (!article) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={article.title}
    >
      <div className="news-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {article.urlToImage && (
          <div className="modal-image-wrap">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="modal-image"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <div className="modal-image-overlay" />
          </div>
        )}

        <div className="modal-body">
          <div className="modal-meta">
            <span className="modal-source">{article.source?.name}</span>
            <span className="modal-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {formatTimeAgo(article.publishedAt)}
              <span className="modal-fulldate"> · {formatFullDate(article.publishedAt)}</span>
            </span>
            {article.author && (
              <span className="modal-author">
                By {article.author.split(',')[0]}
              </span>
            )}
          </div>

          <h2 className="modal-title">{article.title}</h2>

          {article.description && (
            <p className="modal-description">{article.description}</p>
          )}

          {article.content && (
            <div className="modal-content">
              <p>{article.content.replace(/\[\+\d+ chars\]/g, '').trim()}</p>
            </div>
          )}

          <div className="modal-actions">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-btn-primary"
              onClick={e => { if (article.url === '#') e.preventDefault(); }}
            >
              Read Full Article
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14 21 3" />
              </svg>
            </a>
            <button className="modal-btn-secondary" onClick={onClose}>
              Close
            </button>
          </div>

          <p className="modal-credit">
            Source: <strong>{article.source?.name}</strong> · Powered by NewsAPI.org
          </p>
        </div>
      </div>
    </div>
  );
}
