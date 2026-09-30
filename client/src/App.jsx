import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { isAuthenticated, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'register'

  // Loading state while checking token
  if (loading) {
    return (
      <div className="fullscreen-loading">
        <div className="spinner" />
        <p>Loading application...</p>
      </div>
    );
  }

  // If user is authenticated, render protected Dashboard
  if (isAuthenticated) {
    return <DashboardPage />;
  }

  // If not authenticated, toggle between Login and Registration screens
  return authView === 'login' ? (
    <LoginPage onNavigateToRegister={() => setAuthView('register')} />
  ) : (
    <RegisterPage onNavigateToLogin={() => setAuthView('login')} />
  );
}

export default App;
