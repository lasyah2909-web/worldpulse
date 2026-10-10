import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader">
      <div className="loader-inner">
        <div className="loader-rings">
          <div className="ring r1"/>
          <div className="ring r2"/>
          <div className="ring r3"/>
          <div className="loader-logo">
            <svg viewBox="0 0 36 36" fill="none" width="40" height="40">
              <rect width="36" height="36" rx="10" fill="url(#ll)"/>
              <path d="M10 18h4l3-6 4 12 3-8 2 4h4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="ll" x1="0" y1="0" x2="36" y2="36">
                  <stop offset="0%" stopColor="#6366f1"/>
                  <stop offset="100%" stopColor="#10b981"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <div className="loader-name">PulseAI</div>
        <div className="loader-sub">Loading AI &amp; Cybersecurity Intelligence...</div>
        <div className="loader-bar"><div className="loader-fill"/></div>
      </div>
    </div>
  );
}
