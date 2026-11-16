import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { Button } from '../../components/ui';
import Hero from './sections/Hero';
import Pillars from './sections/Pillars';
import Showcase from './sections/Showcase';
import HowItWorks from './sections/HowItWorks';
import Capabilities from './sections/Capabilities';
import ApiSection from './sections/ApiSection';
import Testimonials from './sections/Testimonials';
import Integrations from './sections/Integrations';
import Pricing from './sections/Pricing';
import DocsPreview from './sections/DocsPreview';
import Faq from './sections/Faq';
import CtaBanner from './sections/CtaBanner';
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
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <Link to="/" className={styles.brand}>
            <span className={styles.brandMark} aria-hidden="true">
              <span />
            </span>
            <span className={styles.brandName}>
              Lead<em>Pulse</em>
            </span>
          </Link>

          <nav className={styles.navLinks} aria-label="Marketing sections">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className={styles.navLink}>
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.navRight}>
            {isAuthenticated ? (
              <Button to="/app" variant="primary" size="sm">
                Open dashboard
              </Button>
            ) : (
              <>
                <Link to="/signin" className={styles.navLink}>
                  Sign in
                </Link>
                <Button to="/signup" variant="primary" size="sm">
                  Start free
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Hero />

        <div className={styles.sectionWrap}>
          <Pillars />
          <Showcase />
          <HowItWorks />
          <Capabilities />
          <ApiSection />
          <Testimonials />
          <Integrations />
          <Pricing />
          <DocsPreview />
          <Faq />
        </div>

        <CtaBanner />

        <SiteFooter />
      </main>
    </div>
  );
}
