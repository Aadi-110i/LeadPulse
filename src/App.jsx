import { useState } from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Auth from './pages/Auth/Auth';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  return (
    <div className="app-container">
      <div className="mesh-bg"></div>
      
      {currentView === 'landing' ? (
        <LandingPage onEnterDashboard={() => setCurrentView('auth')} />
      ) : currentView === 'auth' ? (
        <Auth 
          onAuthSuccess={() => setCurrentView('dashboard')} 
          onBack={() => setCurrentView('landing')}
        />
      ) : (
        <Dashboard onBackToLanding={() => setCurrentView('landing')} />
      )}
    </div>
  );
}

export default App;
