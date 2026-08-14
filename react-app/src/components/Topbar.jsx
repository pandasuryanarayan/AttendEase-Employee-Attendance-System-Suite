// src/components/Topbar.jsx
import React from 'react';
import { useApp } from '../context/AppContext';
import { CalendarBadgeIcon } from './Icons';

export const Topbar = ({ pageTitle }) => {
  const { setSidebarOpen } = useApp();

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="topbar">
      <button
        className="hamburger"
        id="hamburger"
        onClick={() => setSidebarOpen((prev) => !prev)}
        aria-label="Toggle Navigation"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <div className="topbar-title">{pageTitle}</div>
      <div className="topbar-right">
        <span className="date-badge">
          <CalendarBadgeIcon size={16} />
          {formattedDate}
        </span>
      </div>
    </header>
  );
};
