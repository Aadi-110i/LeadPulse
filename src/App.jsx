import { useState } from 'react';
import LandingPage from './pages/LandingPage/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');

  return (
    <div className="app-container">
      <div className="mesh-bg"></div>
      <div className="grid-overlay"></div>
      
      {currentView === 'landing' ? (
        <LandingPage onEnterDashboard={() => setCurrentView('dashboard')} />
      ) : (
        <Dashboard onBackToLanding={() => setCurrentView('landing')} />
      )}
    </div>
  );
}

export default App;
