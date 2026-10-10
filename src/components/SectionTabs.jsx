import React from 'react';
import './SectionTabs.css';

const TABS = [
  {
    id: 'ai',
    label: 'Artificial Intelligence',
    icon: '🤖',
    sub: 'LLMs · GPT · Robotics · ML · AGI',
    color: 'var(--ai)',
    grad: 'var(--ai-grad)',
  },
  {
    id: 'cyber',
    label: 'Cybersecurity',
    icon: '🛡️',
    sub: 'SOC · GRC · Threats · Tools · InfoSec',
    color: 'var(--cy)',
    grad: 'var(--cy-grad)',
  },
];

export default function SectionTabs({ active, onChange }) {
  return (
    <div className="tabs-wrap">
      <div className="tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab ${active === t.id ? 'active' : ''}`}
            onClick={() => onChange(t.id)}
            style={{ '--c': t.color, '--g': t.grad }}
          >
            <span className="tab-icon">{t.icon}</span>
            <div className="tab-text">
              <span className="tab-label">{t.label}</span>
              <span className="tab-sub">{t.sub}</span>
            </div>
            {active === t.id && <div className="tab-bar"/>}
          </button>
        ))}
      </div>
    </div>
  );
}
