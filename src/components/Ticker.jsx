import React from 'react';
import './Ticker.css';

export default function Ticker({ items }) {
  const all = [...items, ...items]; // double for seamless loop
  return (
    <div className="ticker">
      <div className="ticker-label">
        <span className="ticker-dot"/>BREAKING
      </div>
      <div className="ticker-track">
        <div className="ticker-belt">
          {all.map((a, i) => (
            <span key={i} className="ticker-item">
              <span className="ticker-bull">◆</span>
              {a.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
