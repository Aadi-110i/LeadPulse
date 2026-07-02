import React, { useState, useEffect } from 'react';
import {
  Mail,
  Lock,
  Globe,
  ArrowRight,
  Loader2,
  Terminal,
  Fingerprint,
  ShieldCheck,
  Cpu,
  ArrowLeft
} from 'lucide-react';
import styles from './Auth.module.css';

import { auth } from '../../firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

const Auth = ({ onAuthSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState(['> INITIALIZING SECURE PROTOCOL...']);

  // Terminal log simulation
  useEffect(() => {
    if (isProcessing) {
      const messages = [
        '> ESTABLISHING ENCRYPTED TUNNEL...',
        '> CONNECTING TO FIREBASE_NODE_01...',
        '> VERIFYING CLOUD_TOKEN...',
        '> CROSS-CHECKING PERMISSIONS...',
        '> ACCESS GRANTED. REDIRECTING...'
      ];
      let i = 0;
      const interval = setInterval(() => {
        if (i < messages.length) {
          setLogs(prev => [...prev.slice(-4), messages[i]]);
          i++;
        } else {
          clearInterval(interval);
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError('');
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      setTimeout(() => {
        setIsProcessing(false);
        onAuthSuccess();
      }, 2000);
    } catch (err) {
      setIsProcessing(false);
      let friendlyError = 'Authentication failed';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        friendlyError = 'Invalid email or access key.';
      } else if (err.code === 'auth/email-already-in-use') {
        friendlyError = 'This account already exists.';
      } else if (err.code === 'auth/weak-password') {
        friendlyError = 'Access key must be at least 6 characters.';
      }
      setError(friendlyError);
      setLogs(prev => [...prev.slice(-4), `> ERROR: ${err.code?.toUpperCase() || 'AUTH_FAILED'}`]);
    }
  };

  const handleGoogleAuth = async () => {
    setIsProcessing(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setTimeout(() => {
        setIsProcessing(false);
        onAuthSuccess();
      }, 2000);
    } catch (err) {
      setIsProcessing(false);
      setError('Cloud auth failed. Please try again.');
      setLogs(prev => [...prev.slice(-4), '> ERROR: CLOUD_AUTH_REJECTED']);
    }
  };

  return (
    <div className={styles.portalWrapper}>
      {/* Background Layers */}
      <div className={styles.nebula} />
      <div className={styles.gridOverlay} />
      <div className={styles.scanner} />
      <div className={styles.backgroundWatermark}>LEADPULSE</div>

      {/* Floating Particles */}
      <div className={styles.particles}>
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className={styles.particle}
            style={{
              left: `${(i * 5.5 + 5) % 100}%`,
              top: `${(i * 7 + 10) % 100}%`,
              animationDelay: `${(i * 0.4) % 5}s`,
              animationDuration: `${10 + (i % 5) * 2}s`,
              opacity: 0.2 + (i % 5) * 0.08,
            }}
          />
        ))}
      </div>

      {/* HUD */}
      <div className={styles.hudTopRight}>
        <div>SYSTEM_UPTIME: 142:08:12:44</div>
        <div>LATENCY: 12ms</div>
        <div>ENCRYPTION: AES-256</div>
      </div>
      <div className={styles.hudBottomLeft}>
        <div>NODE_ID: LP_CLUSTER_04</div>
        <div>COORDS: 40.7128°N, 74.0060°W</div>
      </div>

      {/* Back Button */}
      <button className={styles.backButton} onClick={onBack} disabled={isProcessing}>
        <ArrowLeft size={14} /> Exit Portal
      </button>

      {/* Central Content */}
      <div className={styles.centralHub}>
        {/* Pulse Rings */}
        <div className={styles.pulseRing} />
        <div className={styles.pulseRing} style={{ animationDelay: '2s', width: '900px', height: '900px' }} />

        <div className={styles.splitLayout}>
          {/* Auth Card */}
          <div className={styles.glassCard}>
            <div className={styles.cardGlowTop} />
            <div className={styles.cardGlowLeft} />
            <div className="corner-tl" />
            <div className="corner-br" />

            <div className={styles.authHeader}>
              <div className={styles.authLogo}>
                <div className={styles.logoAura} />
                <Fingerprint size={24} color="var(--cyan)" />
              </div>
              <h1>{isLogin ? 'LeadPulse Access' : 'Create Account'}</h1>
              <p className={styles.subtitle}>
                {isLogin ? 'Authentication required' : 'Initialize your node'}
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputField}>
                <div className={styles.inputIcon}><Mail size={16} /></div>
                <input
                  type="email"
                  placeholder="Developer email"
                  required
                  disabled={isProcessing}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <div className={styles.inputTrace} />
              </div>

              <div className={styles.inputField}>
                <div className={styles.inputIcon}><Lock size={16} /></div>
                <input
                  type="password"
                  placeholder="Access key"
                  required
                  disabled={isProcessing}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
                <div className={styles.inputTrace} />
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <button type="submit" className={styles.portalBtn} disabled={isProcessing}>
                <span className={styles.btnText}>
                  {isProcessing ? 'Synchronizing...' : isLogin ? 'Initiate Session' : 'Initialize API'}
                </span>
                {isProcessing ? (
                  <Loader2 size={18} className={styles.spin} />
                ) : (
                  <ArrowRight size={18} className={styles.arrow} />
                )}
              </button>
            </form>

            <div className={styles.metaActions}>
              <button
                className={styles.toggleBtn}
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                disabled={isProcessing}
              >
                {isLogin ? 'Create Account' : 'Sign In Instead'}
              </button>
              <div className={styles.separator} />
              <button
                className={styles.googleAccess}
                onClick={handleGoogleAuth}
                disabled={isProcessing}
              >
                <Globe size={14} /> Cloud Auth
              </button>
            </div>
          </div>

          {/* Side Panel */}
          <div className={styles.sidePanel}>
            {/* Live Terminal */}
            <div className={styles.terminalWidget}>
              <div className={styles.termHeader}>
                <Terminal size={13} />
                <span>Auth Log Stream</span>
                <div className={styles.termDots}>
                  <span /><span /><span />
                </div>
              </div>
              <div className={styles.termBody}>
                {logs.map((log, i) => (
                  <div key={i} className={styles.logLine} style={{ animationDelay: `${i * 0.05}s` }}>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Tech Badges */}
            <div className={styles.techCluster}>
              <div className={styles.techBadge}><Cpu size={12} /> AI Engine V4</div>
              <div className={styles.techBadge}><ShieldCheck size={12} /> AES-256</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
