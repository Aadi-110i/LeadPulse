import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, CircleAlert, CircleCheck, Copy, Info, TriangleAlert } from 'lucide-react';
import { copyToClipboard } from './clipboard';
import styles from './ui.module.css';

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  to,
  href,
  type = 'button',
  full = false,
  disabled = false,
  className = '',
  ...rest
}) {
  const classes = [
    styles.btn,
    styles[`btn--${variant}`],
    size !== 'md' ? styles[`btn--${size}`] : '',
    full ? styles['btn--full'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Chip                                                                        */
/* -------------------------------------------------------------------------- */

export function Chip({ tone = 'neutral', dot = false, children, className = '' }) {
  return (
    <span className={`${styles.chip} ${styles[`chip--${tone}`]} ${className}`.trim()}>
      {dot ? <span className={styles.chip__dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Form fields                                                                 */
/* -------------------------------------------------------------------------- */

export function Field({ label, hint, error, htmlFor, children }) {
  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.field__label} htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className={styles.field__error} role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className={styles.field__hint}>{hint}</p>
      ) : null}
    </div>
  );
}

export function TextInput({ invalid = false, className = '', ...rest }) {
  return (
    <input
      className={`${styles.input} ${invalid ? styles['input--invalid'] : ''} ${className}`.trim()}
      {...rest}
    />
  );
}

export function Textarea({ invalid = false, className = '', ...rest }) {
  return (
    <textarea
      className={`${styles.input} ${invalid ? styles['input--invalid'] : ''} ${className}`.trim()}
      {...rest}
    />
  );
}

export function Select({ invalid = false, className = '', children, ...rest }) {
  return (
    <select
      className={`${styles.input} ${invalid ? styles['input--invalid'] : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </select>
  );
}

/* -------------------------------------------------------------------------- */
/* Copy button                                                                 */
/* -------------------------------------------------------------------------- */

export function CopyButton({ value, label = 'Copy', copiedLabel = 'Copied', className = '' }) {
  const [state, setState] = useState('idle');
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setState('done');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 1600);
  };

  return (
    <button
      type="button"
      className={`${styles.copy} ${state === 'done' ? styles['copy--done'] : ''} ${className}`.trim()}
      onClick={handleCopy}
      aria-label={`${label} to clipboard`}
    >
      {state === 'done' ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      {state === 'done' ? copiedLabel : label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                        */
/* -------------------------------------------------------------------------- */

export function Tabs({ items, value, onChange, ariaLabel = 'Sections' }) {
  return (
    <div className={styles.tabs} role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={value === item.id}
          className={styles.tab}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* States                                                                      */
/* -------------------------------------------------------------------------- */

export function EmptyState({ icon: Icon, title, body, action }) {
  return (
    <div className={styles.empty}>
      {Icon ? (
        <span className={styles.empty__icon}>
          <Icon size={20} aria-hidden="true" />
        </span>
      ) : null}
      <p className={styles.empty__title}>{title}</p>
      {body ? <p className={styles.empty__body}>{body}</p> : null}
      {action}
    </div>
  );
}

export function Note({ tone = 'neutral', icon: Icon = Info, children }) {
  return (
    <div className={`${styles.note} ${tone !== 'neutral' ? styles[`note--${tone}`] : ''}`.trim()}>
      <Icon size={15} className={styles.note__icon} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

export function Spinner({ large = false }) {
  return <span className={`${styles.spinner} ${large ? styles['spinner--lg'] : ''}`.trim()} role="status" aria-label="Loading" />;
}

/* -------------------------------------------------------------------------- */
/* Toasts                                                                      */
/* -------------------------------------------------------------------------- */

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    ({ title, message, tone = 'neutral', duration = 4200 }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((current) => [...current.slice(-3), { id, title, message, tone }]);
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const store = timers.current;
    return () => {
      store.forEach((timer) => clearTimeout(timer));
      store.clear();
    };
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.toasts} role="status" aria-live="polite">
        {toasts.map((toast) => {
          const Icon =
            toast.tone === 'positive' ? CircleCheck : toast.tone === 'negative' ? TriangleAlert : Info;
          return (
            <div key={toast.id} className={`${styles.toast} ${styles[`toast--${toast.tone}`]}`}>
              <Icon size={16} className={styles.toast__icon} aria-hidden="true" />
              <div className={styles.toast__body}>
                <p className={styles.toast__title}>{toast.title}</p>
                {toast.message ? <p className={styles.toast__message}>{toast.message}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}

export default Button;
