import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthProvider';
import { Spinner, ToastProvider } from './components/ui';
import Landing from './pages/Landing/Landing';
import Docs from './pages/Docs/Docs';
import Auth from './pages/Auth/Auth';

// The dashboard pulls in the charting library, so it loads on demand.
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));

function BootScreen() {
  return (
    <div className="boot" data-surface="app">
      <Spinner large />
      <p className="boot__text">Restoring session…</p>
    </div>
  );
}

function RequireAuth({ children }) {
  const { status, signedOut } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <BootScreen />;

  // An explicit sign-out returns to the marketing site; an expired session goes to sign-in.
  if (signedOut) return <Navigate to="/" replace />;
  if (status !== 'authed') {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function LandingRoute() {
  const { status } = useAuth();
  if (status === 'loading') return <BootScreen />;
  return <Landing />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/signin" element={<Auth mode="signin" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route
            path="/app"
            element={
              <RequireAuth>
                <Suspense fallback={<BootScreen />}>
                  <Dashboard />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route
            path="/app/:section"
            element={
              <RequireAuth>
                <Suspense fallback={<BootScreen />}>
                  <Dashboard />
                </Suspense>
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
