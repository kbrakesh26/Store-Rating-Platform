import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Store Rating App</h1>
          {user && (
            <div className="user-info">
              <span className="user-name">Welcome, {user.name}</span>
              <span className="user-role">({user.role.replace('_', ' ').toUpperCase()})</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;