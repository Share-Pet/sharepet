import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between' }}>
      <span>🐾 KuttaBilli</span>
      <div>
        <Link to="/Signup">🔔</Link>{' '}
        <Link to="/Signup">Sign Up</Link>
      </div>
    </nav>
  );
}
