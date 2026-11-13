import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/endpoints';
import { getAuthToken, setAuthToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // A stored token still has to be validated, so the session starts as "loading".
  const [status, setStatus] = useState(() => (getAuthToken() ? 'loading' : 'anon'));
  // Distinguishes "you signed out" from "you were never signed in".
  const [signedOut, setSignedOut] = useState(false);

  // Restore an existing session on boot.
  useEffect(() => {
    if (!getAuthToken()) return undefined;

    let cancelled = false;

    api
      .me()
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        setStatus('authed');
      })
      .catch(() => {
        if (cancelled) return;
        setAuthToken(null);
        setUser(null);
        setStatus('anon');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (credentials) => {
    const data = await api.signIn(credentials);
    setAuthToken(data.token);
    setUser(data.user);
    setStatus('authed');
    setSignedOut(false);
    return data.user;
  }, []);

  const signUp = useCallback(async (payload) => {
    const data = await api.signUp(payload);
    setAuthToken(data.token);
    setUser(data.user);
    setStatus('authed');
    setSignedOut(false);
    return data.user;
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setStatus('anon');
    setSignedOut(true);
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      signedOut,
      isAuthenticated: status === 'authed',
      signIn,
      signUp,
      signOut,
    }),
    [user, status, signedOut, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
}

export default AuthProvider;
