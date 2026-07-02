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
    // Guard: if Firebase Auth failed to initialize, skip auth listener
    if (!auth) {
      console.warn("[App] Firebase Auth not available — showing landing page.");
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log("Auth State Changed:", currentUser ? "User Logged In" : "No User");
        setUser(currentUser);
        if (currentUser) {
          setCurrentView('dashboard');
        }
        setLoading(false);
      }, (error) => {
        console.error("Auth State Error:", error);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (err) {
      console.error("Firebase Auth initialization failed:", err);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="boot-screen">
        <div className="aurora-bg" />
        <div className="boot-logo">Lead<span>Pulse</span></div>
        <div className="boot-bar">
          <div className="boot-bar-fill" />
        </div>
        <div className="boot-text">Initializing system...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
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
