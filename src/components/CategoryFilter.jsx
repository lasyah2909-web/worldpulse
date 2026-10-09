import React from 'react';
import { CATEGORIES } from '../services/newsService.js';
import './CategoryFilter.css';

export default function CategoryFilter({ selected, onChange }) {
  return (
    <div className="category-filter">
      {CATEGORIES.map(cat => (
        <button
          key={cat.id}
          className={`category-btn ${selected === cat.id ? 'active' : ''}`}
          onClick={() => onChange(cat.id)}
          style={selected === cat.id ? { '--cat-color': cat.color } : {}}
          aria-pressed={selected === cat.id}
        >
          <span className="cat-emoji">{cat.emoji}</span>
          <span className="cat-label">{cat.label}</span>
        </button>
      ))}
    </div>
  );
}
