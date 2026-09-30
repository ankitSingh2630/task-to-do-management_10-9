import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="navbar-logo">📋</span>
          <h1>Task Manager</h1>
        </div>

        {user && (
          <div className="navbar-actions">
            <span className="navbar-user">
              Welcome, <strong>{user.name}</strong>
            </span>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={logout}
              title="Log out of your account"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
