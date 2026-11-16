import { Link } from 'react-router-dom';
import { ArrowRight, Globe, Mail, Send } from 'lucide-react';
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
  {
    title: 'Company',
    links: [
      { label: 'Customers', href: '#customers' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'FAQ', href: '#faq' },
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

          <form
            className={styles.newsletter}
            onSubmit={(event) => event.preventDefault()}
            aria-label="Subscribe to release notes"
          >
            <label className="visually-hidden" htmlFor="footer-email">
              Email address
            </label>
            <input
              id="footer-email"
              type="email"
              name="email"
              className={styles.newsletterInput}
              placeholder="you@company.com"
              autoComplete="email"
            />
            <button type="submit" className={styles.newsletterButton} aria-label="Subscribe">
              <Send size={15} aria-hidden="true" />
            </button>
          </form>

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

        <div className={styles.footerBottomMeta}>
          <span className={styles.footerBottomNote}>
            Figures on this page are illustrative. Dashboard numbers come from the live database.
          </span>
          <span className={styles.footerSocial}>
            <a href="https://github.com/Aadi-110i/LeadPulse" className={styles.footerSocialLink}>
              <Globe size={15} aria-hidden="true" />
              <span className="visually-hidden">Repository</span>
            </a>
            <a href="mailto:hello@leadpulse.dev" className={styles.footerSocialLink}>
              <Mail size={15} aria-hidden="true" />
              <span className="visually-hidden">Email us</span>
            </a>
            <Link to="/docs" className={styles.footerSocialLink}>
              <ArrowRight size={15} aria-hidden="true" />
              <span className="visually-hidden">Documentation</span>
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
