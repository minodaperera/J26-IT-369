import React from 'react';
import Navbar from '../common/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0', marginTop: 'auto' }}>
        &copy; {new Date().getFullYear()} SafeMaga Research Group. All rights reserved.
      </footer>
    </div>
  );
};

export default MainLayout;
