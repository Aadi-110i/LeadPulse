import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/ui';
import Hero from './sections/Hero';
import HowItWorks from './sections/HowItWorks';
import Features from './sections/Features';
import ApiSection from './sections/ApiSection';
import Pricing from './sections/Pricing';
import DocsPreview from './sections/DocsPreview';
import SiteFooter from './sections/SiteFooter';
import styles from './Landing.module.css';

const NAV_ITEMS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#api', label: 'API' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#docs', label: 'Docs' },
];

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={styles.page} data-surface="marketing">
      <aside className={styles.rail}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <span />
          </span>
          <span className={styles.brandName}>
            Lead<em>Pulse</em>
          </span>
        </Link>

        <nav className={styles.railNav} aria-label="Marketing sections">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={styles.railLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className={styles.railFoot}>
          <dl className={styles.railStat}>
            <dt>Endpoints</dt>
            <dd>7</dd>
          </dl>
          <dl className={styles.railStat}>
            <dt>Queue</dt>
            <dd className={styles.railStatus}>
              <span className={styles.railDot} aria-hidden="true" />
              Redis
            </dd>
          </dl>
          {isAuthenticated ? (
            <Button to="/app" variant="primary" size="sm" full>
              Open dashboard
            </Button>
          ) : (
            <>
              <Link to="/signin" className={styles.railLink}>
                Sign in
              </Link>
              <Button to="/signup" variant="primary" size="sm" full>
                Start free
              </Button>
            </>
          )}
        </div>
      </aside>

      <main className={styles.sheet}>
        <Hero />
        <HowItWorks />
        <Features />
        <ApiSection />
        <Pricing />
        <DocsPreview />
        <SiteFooter />
      </main>
    </div>
  );
}
