import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ lastUpdated, onRefresh, loading }) {
  const [time, setTime] = useState(new Date());
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const refresh = () => { setSpin(true); onRefresh(); setTimeout(()=>setSpin(false),1200); };

  return (
    <header className="hdr">
      <div className="hdr-inner">

        {/* Logo */}
        <div className="hdr-logo">
          <div className="logo-mark">
            <svg viewBox="0 0 36 36" fill="none" width="36" height="36">
              <rect width="36" height="36" rx="10" fill="url(#lg)"/>
              <path d="M10 18h4l3-6 4 12 3-8 2 4h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <div className="logo-name">PulseAI</div>
            <div className="logo-sub">AI &amp; Cybersecurity Intelligence</div>
          </div>
          <div className="live-chip">
            <span className="live-dot"/>LIVE
          </div>
        </div>

        {/* Clock */}
        <div className="hdr-clock">
          <div className="clock-time">
            {time.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'})}
          </div>
          <div className="clock-date">
            {time.toLocaleDateString([],{weekday:'short',month:'short',day:'numeric',year:'numeric'})}
          </div>
        </div>

        {/* Actions */}
        <div className="hdr-actions">
          {lastUpdated && (
            <span className="hdr-updated">
              Updated {lastUpdated.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
            </span>
          )}
          <button className={`refresh-btn ${spin?'spin':''}`} onClick={refresh} title="Refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="17" height="17">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
          </button>
        </div>

      </div>
    </header>
  );
}
