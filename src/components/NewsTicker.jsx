import React from 'react';
import './NewsTicker.css';

export default function NewsTicker({ articles }) {
  // Duplicate for seamless infinite loop
  const items = [...articles, ...articles];

  return (
    <div className="ticker-wrapper">
      <div className="ticker-label">
        <span className="ticker-dot" />
        BREAKING
      </div>
      <div className="ticker-track">
        <div className="ticker-content">
          {items.map((article, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-bullet">◆</span>
              {article.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
