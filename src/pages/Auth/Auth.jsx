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

const Auth = ({ onAuthSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState(['> INITIALIZING SECURE PROTOCOL...']);

  // Simulate scrolling terminal logs when processing or typing
  useEffect(() => {
    if (isProcessing) {
      const messages = [
        '> ESTABLISHING ENCRYPTED TUNNEL...',
        '> HANDSHAKING WITH AUTH_SERVER_04...',
        '> VERIFYING JWT SIGNATURE...',
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
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        // Short delay to allow the "Access Granted" log to appear
        setTimeout(() => {
          setIsProcessing(false);
          onAuthSuccess();
        }, 2000);
      } else {
        setIsProcessing(false);
        setError(data.message || 'Authentication failed');
        setLogs(prev => [...prev.slice(-4), `> ERROR: ${data.message?.toUpperCase() || 'AUTH_FAILED'}`]);
      }
    } catch (err) {
      setIsProcessing(false);
      setError('Could not connect to authentication server.');
      setLogs(prev => [...prev.slice(-4), '> ERROR: CONNECTION_REFUSED']);
    }
  };

  return (
    <div className={styles.portalWrapper}>
      {/* Immersive Background Elements */}
      <div className={styles.nebula}></div>
      <div className={styles.scanner}></div>

      <button className={styles.backButton} onClick={onBack} disabled={isProcessing}>
        <ArrowLeft size={16} /> EXIT_TO_SYSTEM
      </button>
      
      <div className={styles.centralHub}>
        {/* Decorative Pulse Rings */}
        <div className={styles.pulseRing}></div>
        <div className={styles.pulseRing} style={{ animationDelay: '1s', width: '600px', height: '600px' }}></div>

        <div className={styles.glassCard}>
          <div className={styles.cardGlow}></div>
          
          <div className={styles.header}>
            <div className={styles.authLogo}>
              <Fingerprint size={32} color="var(--violet)" />
              <div className={styles.logoAura}></div>
            </div>
            <h1>{isLogin ? 'LeadPulse Access' : 'Create Node'}</h1>
            <p className={styles.subtitle}>
              {isLogin ? 'Authentication required for API cluster' : 'Initialize your lead management engine'}
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputField}>
              <div className={styles.inputIcon}><Mail size={18} /></div>
              <input 
                type="email" 
                placeholder="Developer Email" 
                required 
                disabled={isProcessing}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className={styles.inputTrace}></div>
            </div>

            <div className={styles.inputField}>
              <div className={styles.inputIcon}><Lock size={18} /></div>
              <input 
                type="password" 
                placeholder="Access Key" 
                required 
                disabled={isProcessing}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className={styles.inputTrace}></div>
            </div>

            {error && <div className={styles.errorMessage}>{error}</div>}

            <button type="submit" className={styles.portalBtn} disabled={isProcessing}>
              <span className={styles.btnText}>
                {isProcessing ? 'SYNCHRONIZING...' : isLogin ? 'INITIATE SESSION' : 'INITIALIZE API'}
              </span>
              {isProcessing ? (
                <Loader2 size={20} className={styles.spin} />
              ) : (
                <ArrowRight size={20} className={styles.arrow} />
              )}
            </button>
          </form>

          <div className={styles.metaActions}>
            <button 
              className={styles.toggleBtn} 
              onClick={() => setIsLogin(!isLogin)}
              disabled={isProcessing}
            >
              {isLogin ? 'NEW_ACCOUNT.SH' : 'EXISTING_USER.LOG'}
            </button>
            <div className={styles.separator}></div>
            <button className={styles.googleAccess} disabled={isProcessing}>
              <Globe size={16} /> CLOUD_AUTH
            </button>
          </div>
        </div>

        {/* Live Terminal Widget */}
        <div className={`${styles.terminalWidget} glass-panel`}>
          <div className={styles.termHeader}>
            <Terminal size={14} /> <span>AUTH_LOG.STREAM</span>
          </div>
          <div className={styles.termBody}>
            {logs.map((log, i) => (
              <div key={i} className={styles.logLine}>{log}</div>
            ))}
          </div>
        </div>

        {/* Tech Badges */}
        <div className={styles.techCluster}>
          <div className={styles.techBadge}><Cpu size={14} /> AI_ENGINE_V4</div>
          <div className={styles.techBadge}><ShieldCheck size={14} /> AES_256</div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
