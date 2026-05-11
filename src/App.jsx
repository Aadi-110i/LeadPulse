import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import LandingPage from './pages/LandingPage/LandingPage';
import Dashboard from './pages/Dashboard/Dashboard';
import Auth from './pages/Auth/Auth';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setCurrentView('dashboard');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="mesh-bg"></div>
        <div style={{ color: 'var(--violet)', fontFamily: 'var(--font-mono)', fontSize: '1rem', letterSpacing: '0.2em' }}>
          BOOTING_SYSTEM...
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="mesh-bg"></div>
      
      {currentView === 'landing' ? (
        <LandingPage onEnterDashboard={() => user ? setCurrentView('dashboard') : setCurrentView('auth')} />
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
