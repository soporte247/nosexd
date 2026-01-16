import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import AnalysisPage from './pages/AnalysisPage';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard' | 'analysis'>('login');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setCurrentPage('dashboard');
      } catch (error) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('authToken', userData.token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedProject(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setCurrentPage('login');
  };

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    setCurrentPage('analysis');
  };

  const handleBack = () => {
    setSelectedProject(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="app loading">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {currentPage === 'login' && <LoginPage onLogin={handleLogin} />}
      
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          onSelectProject={handleSelectProject}
        />
      )}
      
      {currentPage === 'analysis' && user && selectedProject && (
        <AnalysisPage 
          project={selectedProject}
          user={user}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
