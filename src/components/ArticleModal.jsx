import React, { useEffect, useState } from 'react';
import { timeAgo, fullDate } from '../services/newsService.js';
import './ArticleModal.css';

export default function ArticleModal({ article, onClose }) {
  const [imgErr, setImgErr] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', h);
    };
  }, [onClose]);

  // Clean content — remove "[+N chars]" suffix NewsData adds
  const cleanContent = (article.content || '')
    .replace(/\[\+\d+\s*chars?\]/gi, '')
    .trim();

  const desc = article.description || '';

  // Build the best possible summary from what we have:
  // 1. Full description
  // 2. Content (up to ~500 chars, trimmed at sentence boundary)
  const contentPreview = cleanContent
    ? trimAtSentence(cleanContent, 500)
    : '';

  // Combine desc + content, avoiding repetition
  const fullText = buildFullText(desc, contentPreview);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">

        {/* Close */}
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </button>

        {/* Image */}
        {!imgErr && article.urlToImage && (
          <div className="modal-img-wrap">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="modal-img"
              onError={() => setImgErr(true)}
            />
            <div className="modal-img-fade"/>
          </div>
        )}

        <div className="modal-body">

          {/* Meta row */}
          <div className="modal-meta">
            <span className="modal-source">{article.source?.name}</span>
            <span className="modal-time">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
              {timeAgo(article.publishedAt)}
              <span className="modal-fulldate"> · {fullDate(article.publishedAt)}</span>
            </span>
            {article.author && (
              <span className="modal-author">By {article.author.split(',')[0]}</span>
            )}
          </div>

          {/* Title */}
          <h2 className="modal-title">{article.title}</h2>

          {/* Summary label */}
          <div className="modal-summary-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
            </svg>
            Article Summary
          </div>

          {/* Full text content */}
          <div className="modal-text">
            {fullText.map((para, i) => (
              <p key={i} className="modal-para">{para}</p>
            ))}
          </div>

          {/* Source note */}
          <div className="modal-source-note">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Showing available preview. Read the full article for complete coverage.
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-cta"
              onClick={e => { if (!article.url || article.url === '#') e.preventDefault(); }}
            >
              Read Full Article
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
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

// ─── Helpers ────────────────────────────────────────────────────────────────

// Trim text at last complete sentence within maxChars
function trimAtSentence(text, maxChars) {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  // Find last sentence-ending punctuation
  const lastSentence = Math.max(
    cut.lastIndexOf('. '),
    cut.lastIndexOf('! '),
    cut.lastIndexOf('? '),
  );
  if (lastSentence > maxChars * 0.5) {
    return cut.slice(0, lastSentence + 1).trim();
  }
  return cut.trim() + '…';
}

// Build readable paragraphs from description + content, no repetition
function buildFullText(desc, content) {
  const paras = [];

  if (desc) paras.push(desc.trim());

  if (content) {
    // If content starts with desc text, skip that part
    const descStart = desc.slice(0, 40).toLowerCase();
    const contentLower = content.toLowerCase();
    const overlap = contentLower.startsWith(descStart);
    const contentToAdd = overlap
      ? content.slice(desc.length).trim()
      : content.trim();

    if (contentToAdd.length > 30) {
      // Split into paragraphs at double newlines or after ~200 chars at sentence boundaries
      const sentences = contentToAdd.match(/[^.!?]+[.!?]+/g) || [contentToAdd];
      let para = '';
      sentences.forEach(s => {
        para += s;
        if (para.length > 200) {
          paras.push(para.trim());
          para = '';
        }
      });
      if (para.trim().length > 20) paras.push(para.trim());
    }
  }

  if (!paras.length) paras.push('No preview available for this article.');
  return paras;
}
