import React, { useState } from 'react';
import { timeAgo, fullDate } from '../services/newsService.js';
import './NewsCard.css';

const AI_COLORS  = ['#6366f1','#8b5cf6','#a78bfa','#7c3aed','#6d28d9'];
const CY_COLORS  = ['#10b981','#06b6d4','#059669','#0891b2','#14b8a6'];
const BG_GRADS = [
  'linear-gradient(135deg,#0f0f20,#1a1a35)',
  'linear-gradient(135deg,#0f1f15,#1a3525)',
  'linear-gradient(135deg,#1f0f10,#352025)',
  'linear-gradient(135deg,#0f1520,#1a2535)',
  'linear-gradient(135deg,#1a0f20,#2d1a35)',
];

export default function NewsCard({ article, index, onSelect, section }) {
  const [err, setErr] = useState(false);
  const colors = section === 'ai' ? AI_COLORS : CY_COLORS;
  const accent  = colors[index % colors.length];
  const bgGrad  = BG_GRADS[index % BG_GRADS.length];
  const initial = (article.source?.name || 'N')[0].toUpperCase();

  return (
    <article
      className="nc"
      onClick={()=>onSelect(article)}
      role="button" tabIndex={0}
      onKeyDown={e=>e.key==='Enter'&&onSelect(article)}
      style={{'--a':accent, animationDelay:`${index*35}ms`}}
    >
      {/* Image */}
      <div className="nc-img-wrap">
        {!err && article.urlToImage
          ? <img src={article.urlToImage} alt={article.title} className="nc-img"
              loading="lazy" onError={()=>setErr(true)}/>
          : <div className="nc-img-fb" style={{background:bgGrad}}>
              <span className="nc-fb-letter" style={{color:accent}}>{initial}</span>
              <span className="nc-fb-src">{article.source?.name}</span>
            </div>
        }
        <div className="nc-tint"/>
        <div className="nc-src-badge">{article.source?.name}</div>
      </div>

      {/* Body */}
      <div className="nc-body">
        <h2 className="nc-title">{article.title}</h2>
        {article.description && <p className="nc-desc">{article.description}</p>}

        <div className="nc-footer">
          <span className="nc-time" title={fullDate(article.publishedAt)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            {timeAgo(article.publishedAt)}
          </span>
          <span className="nc-date">{fullDate(article.publishedAt)}</span>
          <button className="nc-read" onClick={e=>{e.stopPropagation();onSelect(article);}}>
            Read →
          </button>
        </div>
      </div>

      <div className="nc-accent-bar"/>
    </article>
  );
}
