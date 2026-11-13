import { Link } from 'react-router-dom';
import styles from '../Landing.module.css';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Dashboard', to: '/app' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API reference', to: '/docs' },
      { label: 'Log a call', to: '/docs#log-call' },
      { label: 'List leads', to: '/docs#list-leads' },
      { label: 'Observability', to: '/docs#observability' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'Sign in', to: '/signin' },
      { label: 'Create account', to: '/signup' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerBrand}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <span />
            </span>
            <span className={styles.brandName}>
              Lead<em>Pulse</em>
            </span>
          </Link>
          <p className={styles.footerTagline}>
            The call lifecycle, from hangup to follow-up, on one API.
          </p>
          <p className={styles.footerStatus}>
            <span className={styles.statusDot} aria-hidden="true" />
            All systems operational
          </p>
        </div>

        <div className={styles.footerLinks}>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className={styles.footerColumnTitle}>{column.title}</p>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.to ? (
                      <Link to={link.to} className={styles.footerLink}>
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className={styles.footerLink}>
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} LeadPulse. A recreation of the open-source project.</p>
        <p className={styles.footerBottomNote}>
          Figures on this page are illustrative. Dashboard numbers come from the live database.
        </p>
      </div>
    </footer>
  );
}
