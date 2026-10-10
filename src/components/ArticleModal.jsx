import React, { useEffect, useState } from 'react';
import { timeAgo, fullDate } from '../services/newsService.js';
import './ArticleModal.css';

export default function ArticleModal({ article, onClose }) {
  const [err, setErr] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', h); };
  }, [onClose]);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {!err && article.urlToImage && (
          <div className="modal-img-wrap">
            <img src={article.urlToImage} alt={article.title} className="modal-img" onError={()=>setErr(true)}/>
            <div className="modal-img-fade"/>
          </div>
        )}

        <div className="modal-body">
          <div className="modal-meta">
            <span className="modal-source">{article.source?.name}</span>
            <span className="modal-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {timeAgo(article.publishedAt)}
              <span className="modal-fulldate"> · {fullDate(article.publishedAt)}</span>
            </span>
            {article.author && <span className="modal-author">By {article.author.split(',')[0]}</span>}
          </div>

          <h2 className="modal-title">{article.title}</h2>

          {article.description && (
            <p className="modal-desc">{article.description}</p>
          )}

          {article.content && (
            <p className="modal-content">
              {article.content.replace(/\[\+\d+ chars\]/g,'').trim()}
            </p>
          )}

          <div className="modal-actions">
            <a
              href={article.url} target="_blank" rel="noopener noreferrer"
              className="modal-cta"
              onClick={e => { if(!article.url || article.url==='#') e.preventDefault(); }}
            >
              Read Full Article
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14 21 3"/>
              </svg>
            </a>
            <button className="modal-cancel" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
