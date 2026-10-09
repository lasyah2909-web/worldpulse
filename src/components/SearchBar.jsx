import React, { useState, useRef } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, value }) {
  const [input, setInput] = useState(value || '');
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setInput(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSearch(val), 500);
  };

  const handleClear = () => {
    setInput('');
    onSearch('');
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    clearTimeout(timerRef.current);
    onSearch(input);
  };

  return (
    <form className="search-form" onSubmit={handleSubmit} role="search">
      <div className="search-inner">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder="Search world news..."
          value={input}
          onChange={handleChange}
          aria-label="Search news"
        />
        {input && (
          <button type="button" className="search-clear" onClick={handleClear} aria-label="Clear search">
            ✕
          </button>
        )}
        <button type="submit" className="search-btn">
          Search
        </button>
      </div>
    </form>
  );
}
