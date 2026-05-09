import React, { useState } from 'react';
import { Mail, Lock, Chrome, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import styles from './Auth.module.css';

const Auth = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock authentication
    onAuthSuccess();
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authContainer}>
        <div className={`${styles.authCard} glass-panel fade-in`}>
          <div className={styles.header}>
            <div className={styles.logoMark}>
              <div className={styles.logoInner}></div>
            </div>
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Sign in to your LeadPulse dashboard' : 'Start your 14-day free API trial'}</p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="email"><Mail size={16} /> Email Address</label>
              <input 
                type="email" 
                id="email" 
                placeholder="name@company.com" 
                required 
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password"><Lock size={16} /> Password</label>
              <input 
                type="password" 
                id="password" 
                placeholder="••••••••" 
                required 
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              {isLogin ? 'Sign In' : 'Get Started'} <ArrowRight size={18} />
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR</span>
          </div>

          <button className={styles.googleBtn}>
            <Chrome size={20} /> Continue with Google
          </button>

          <div className={styles.footer}>
            {isLogin ? (
              <p>Don't have an account? <button onClick={() => setIsLogin(false)}>Sign Up</button></p>
            ) : (
              <p>Already have an account? <button onClick={() => setIsLogin(true)}>Log In</button></p>
            )}
          </div>
        </div>
      </div>
      <div className={styles.authVisual}>
        <div className={styles.orb}></div>
        <div className={styles.grid}></div>
      </div>
    </div>
  );
};

export default Auth;
