import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CircleCheck, KeyRound, Mail } from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { Button, Field, Note, TextInput } from '../../components/ui';
import styles from './Auth.module.css';

const PROMISES = [
  'Every call summarised and scored the moment it ends.',
  'Follow-ups queued on Redis with a retry budget.',
  'One REST API that fits inside the CRM you already run.',
];

export default function Auth({ mode = 'signin' }) {
  const isSignup = mode === 'signup';
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const destination = location.state?.from ?? '/app';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);

    try {
      if (isSignup) {
        await signUp({ email: email.trim(), password, name: name.trim() || undefined });
      } else {
        await signIn({ email: email.trim(), password });
      }
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message ?? 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function useDemoAccount() {
    setError('');
    setBusy(true);
    try {
      await signIn({ email: 'demo@leadpulse.dev', password: 'demo1234' });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err.message ?? 'The demo account is unavailable. Make sure the server is running.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page} data-surface="app">
      <section className={styles.panel}>
        <Link to="/" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to leadpulse.dev
        </Link>

        <div className={styles.formWrap}>
          {/* Brand in auth */}
          <Link to="/" className={styles.authBrand}>
            <span className={styles.authBrandMark} aria-hidden="true">
              <span />
            </span>
            <span className={styles.authBrandName}>
              Lead<em>Pulse</em>
            </span>
          </Link>

          <h1 className={styles.title}>
            {isSignup ? 'Create your workspace' : 'Welcome back'}
          </h1>
          <p className={styles.subtitle}>
            {isSignup
              ? 'One account. Every call, every follow-up, one API key.'
              : 'Sign in to open the live pipeline and the queue behind it.'}
          </p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            {isSignup ? (
              <Field label="Name" htmlFor="name" hint="Optional — shown on the dashboard.">
                <TextInput
                  id="name"
                  name="name"
                  autoComplete="name"
                  placeholder="Alex Moreau"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={busy}
                />
              </Field>
            ) : null}

            <Field label="Email" htmlFor="email">
              <TextInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={busy}
                invalid={!!error && !email.trim()}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              hint={isSignup ? 'At least 6 characters.' : undefined}
            >
              <TextInput
                id="password"
                name="password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={busy}
                invalid={!!error && !password}
              />
            </Field>

            {error ? <Note tone="negative">{error}</Note> : null}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              full
              disabled={busy}
            >
              {busy ? 'Working…' : isSignup ? 'Create account' : 'Sign in'}
            </Button>
          </form>

          {!isSignup ? (
            <>
              <div className={styles.divider}>
                <span>or</span>
              </div>
              <Button
                variant="secondary"
                size="lg"
                full
                onClick={useDemoAccount}
                disabled={busy}
              >
                Use the demo account
              </Button>
              <p className={styles.demoHint}>
                demo@leadpulse.dev &middot; 64 seeded leads and 152 recorded calls.
              </p>
            </>
          ) : null}

          <p className={styles.switchMode}>
            {isSignup ? 'Already have an account?' : 'No account yet?'}{' '}
            <Link to={isSignup ? '/signin' : '/signup'}>
              {isSignup ? 'Sign in' : 'Create one'}
            </Link>
          </p>
        </div>
      </section>

      <aside className={styles.aside}>
        <div className={styles.asideInner}>
          <p className={styles.asideHeading}>Why LeadPulse</p>
          <ul className={styles.promises}>
            {PROMISES.map((promise) => (
              <li key={promise}>
                <CircleCheck size={16} aria-hidden="true" />
                <span>{promise}</span>
              </li>
            ))}
          </ul>

          <div className={styles.sample}>
            <div className={styles.sampleHead}>
              <span className="micro">Session</span>
              <span className={styles.sessionLive}>Active</span>
            </div>
            <dl className={styles.sampleRows}>
              <div>
                <dt className="micro">Auth</dt>
                <dd>
                  <KeyRound size={13} aria-hidden="true" />
                  Bearer LP_KEY_••••
                </dd>
              </div>
              <div>
                <dt className="micro">Email</dt>
                <dd>
                  <Mail size={13} aria-hidden="true" />
                  you@company.com
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </aside>
    </div>
  );
}
