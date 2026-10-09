import React, { useState, useEffect } from 'react';
import './Header.css';

export default function Header({ lastUpdated, onRefresh, isDemoMode }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [spinning, setSpinning] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleRefresh = () => {
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 1000);
  };

  const formatTime = (date) =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const formatDate = (date) =>
    date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <header className="header">
      <div className="header-bg" />
      <div className="header-inner">
        <div className="header-logo">
          <div className="logo-icon">
            <span className="logo-globe">🌐</span>
          </div>
          <div className="logo-text">
            <span className="logo-name">WorldPulse</span>
            <span className="logo-tagline">Real-Time Global News</span>
          </div>
          <div className="live-badge">
            <span className="live-dot" />
            LIVE
          </div>
        </div>

        <div className="header-center">
          <div className="time-display">
            <span className="time-clock">{formatTime(currentTime)}</span>
            <span className="time-date">{formatDate(currentTime)}</span>
          </div>
        </div>

        <div className="header-actions">
          {lastUpdated && (
            <span className="last-updated">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isDemoMode && (
            <span className="demo-indicator">⚠️ Demo Mode</span>
          )}
          <button
            className={`btn-refresh ${spinning ? 'spinning' : ''}`}
            onClick={handleRefresh}
            title="Refresh news"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M23 4v6h-6M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
