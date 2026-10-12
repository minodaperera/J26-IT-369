import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.svg';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <img src={logo} alt="SafeMaga Logo" />
        <span>SafeMaga</span>
      </Link>
      <nav className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        {user ? (
          <button className="btn btn-secondary" onClick={logout}>
            Logout ({user.name || 'User'})
          </button>
        ) : (
          <Link to="/dashboard" className="btn btn-primary">
            Get Started
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
