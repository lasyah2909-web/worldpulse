import React, { useState, useRef } from 'react';
import './SearchBar.css';

export default function SearchBar({ onSearch, color, placeholder }) {
  const [val, setVal] = useState('');
  const timer = useRef(null);

  const change = e => {
    const v = e.target.value;
    setVal(v);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(v), 500);
  };
  const clear = () => { setVal(''); onSearch(''); };
  const submit = e => { e.preventDefault(); clearTimeout(timer.current); onSearch(val); };

  return (
    <form className="sb" onSubmit={submit} style={{'--c':color}}>
      <svg className="sb-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        className="sb-input"
        type="search"
        value={val}
        onChange={change}
        placeholder={placeholder || 'Search...'}
        aria-label="Search"
      />
      {val && <button type="button" className="sb-clear" onClick={clear}>✕</button>}
      <button type="submit" className="sb-btn">Search</button>
    </form>
  );
}
