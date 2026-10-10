import React, { useState } from 'react';
import { timeAgo, fullDate } from '../services/newsService.js';
import './HeroCard.css';

export default function HeroCard({ article, onSelect, section }) {
  const [err, setErr] = useState(false);
  const isAI  = section === 'ai';
  const color = isAI ? '#6366f1' : '#10b981';
  const grad  = isAI ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#10b981,#06b6d4)';
  const tag   = isAI ? 'AI' : 'CYBERSECURITY';

  return (
    <div className="hero" onClick={()=>onSelect(article)} role="button" tabIndex={0}
      onKeyDown={e=>e.key==='Enter'&&onSelect(article)}>

      <div className="hero-img-wrap">
        {!err
          ? <img src={article.urlToImage} alt={article.title} className="hero-img" onError={()=>setErr(true)}/>
          : <div className="hero-img-fb" style={{background:`linear-gradient(135deg,${color}22,${color}08)`}}>
              <span className="hero-fb-icon">{isAI?'🤖':'🛡️'}</span>
            </div>
        }
        <div className="hero-overlay"/>
      </div>

      <div className="hero-body">
        <div className="hero-tags">
          <span className="hero-tag" style={{background:grad}}>{tag}</span>
          <span className="hero-source">{article.source?.name}</span>
          <span className="hero-time" title={fullDate(article.publishedAt)}>
            🕐 {timeAgo(article.publishedAt)}
          </span>
        </div>
        <h1 className="hero-title">{article.title}</h1>
        {article.description && <p className="hero-desc">{article.description}</p>}
        <button className="hero-btn" style={{background:grad}}>
          Read Full Story
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
