import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const tabs = ['home', 'community', 'events', 'profile'];

  return (
    <footer style={{ display: 'flex', justifyContent: 'space-around' }}>
      {tabs.map(tab => (
        <Link
          key={tab}
          to={tab === 'home' ? '/' : '/' + tab}
          style={{
            fontWeight: location.pathname === '/' + tab || (tab === 'home' && location.pathname === '/') ? 'bold' : 'normal'
          }}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </Link>
      ))}
    </footer>
  );
}
