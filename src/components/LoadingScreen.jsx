import React from 'react';
import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <div className="loading-globe">🌐</div>
          <div className="loading-rings">
            <div className="ring ring-1" />
            <div className="ring ring-2" />
            <div className="ring ring-3" />
          </div>
        </div>
        <h1 className="loading-title">WorldPulse</h1>
        <p className="loading-sub">Fetching global news...</p>
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
