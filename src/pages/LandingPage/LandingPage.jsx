import React, { useState, useEffect, useRef } from 'react';
import {
  Brain,
  MessageSquare,
  BarChart3,
  Zap,
  Activity,
  ArrowRight,
  Terminal,
  Cpu,
  Globe,
  Lock,
  ChevronRight,
  GitBranch,
  Sparkles,
  Shield,
  TrendingUp,
  Phone,
  Bot,
  Layers
} from 'lucide-react';
import { FEATURES, STATS } from '../../data/mockData';
import styles from './LandingPage.module.css';

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useReveal(options = {}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── API Snippets ─────────────────────────────────────────────────────────────
const API_SNIPPETS = {
  'POST /calls': {
    title: '// Initialize call session',
    code: `const response = await fetch(
  'https://api.leadpulse.io/v1/calls',
  {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer LP_KEY_••••',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      caller: "+15550102",
      duration: 145,
      audio_url: "s3://rec/call_92.mp3"
    })
  }
);

// Returns structured AI analysis`
  },
  'GET /leads': {
    title: '// Fetch AI-ranked leads',
    code: `const leads = await fetch(
  'https://api.leadpulse.io/v1/leads' +
  '?status=new&score_min=80',
  {
    headers: {
      'Authorization': 'Bearer LP_KEY_••••'
    }
  }
);

const { data, meta } = await leads.json();
// → Paginated, AI-scored results`
  },
  'WEBHOOK': {
    title: '// Automated follow-up trigger',
    code: `{
  "event": "followup.sent",
  "lead_id": "lead_9283",
  "channel": "whatsapp",
  "ai_summary": "Interested in bulk pricing.",
  "sentiment": 0.87,
  "next_action": "demo_scheduled",
  "timestamp": "2024-05-12T10:30:00Z"
}`
  }
};

// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ onEnterDashboard }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
      <div className={styles.navBrand}>
        <div className={styles.logoMark}>
          <div className={styles.logoInner} />
        </div>
        <span className={styles.logoText}>
          Lead<span>Pulse</span>
        </span>
      </div>

      <div className={styles.navLinks}>
        <a href="#features" className={styles.navLink}>Features</a>
        <a href="#api" className={styles.navLink}>API</a>
        <a href="#pricing" className={styles.navLink}>Pricing</a>
        <a href="#docs" className={styles.navLink}>Docs</a>
      </div>

      <div className={styles.navActions}>
        <button className={styles.btnSecondary} onClick={onEnterDashboard}>Sign In</button>
        <button className={styles.btnPrimary} onClick={onEnterDashboard}>
          Get Started <ArrowRight size={15} />
        </button>
      </div>
    </nav>
  );
};

// ─── Hero ─────────────────────────────────────────────────────────────────────
const Hero = ({ onEnterDashboard }) => {
  const [typed, setTyped] = useState('');
  const fullText = 'AI-First APIs';

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTyped(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  const contentRef = useReveal();
  const visualRef = useReveal();

  return (
    <header className={styles.hero}>
      <div className={styles.heroGlow} />

      <div className={`${styles.heroContent} reveal`} ref={contentRef}>
        <div className={styles.badge}>
          <span className={`${styles.badgePulse} glow-dot`} />
          Next-Gen Lead Intelligence
        </div>

        <h1 className={styles.heroTitle}>
          Automate sales with <br />
          <span className={`${styles.gradientText}`}>{typed}</span>
          <span className="cursor" />
        </h1>

        <p className={styles.heroSub}>
          Log calls, extract intent with LLMs, and fire WhatsApp follow-ups automatically.
          Built for high-performance sales teams who live in the terminal.
        </p>

        <div className={styles.heroActions}>
          <button className={styles.btnLarge} onClick={onEnterDashboard}>
            Start Building <ArrowRight size={16} />
          </button>
          <button className={styles.btnGhost}>View Docs</button>
        </div>
      </div>

      <div className={`${styles.heroVisual} reveal-right`} ref={visualRef} style={{ transitionDelay: '0.15s' }}>
        <div className={styles.visualContainer}>
          <div className={styles.visualOrb} />

          {/* Floating mini tags */}
          <div className={`${styles.floatingTag} ${styles.tag1}`}>
            <Activity size={12} />
            <span>AI Score: 94%</span>
          </div>
          <div className={`${styles.floatingTag} ${styles.tag2}`}>
            <Phone size={12} />
            <span>12 calls analyzed</span>
          </div>

          <div className={styles.visualCard}>
            <div className={styles.cardGlowLine} />
            <div className="corner-tl" />
            <div className="corner-br" />

            <div className={styles.cardHeader}>
              <div className={styles.dots}>
                <span /><span /><span />
              </div>
              <span className={styles.cardHeaderTitle}>Lead Intelligence</span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.skeletonLine} style={{ width: '100%' }} />
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
              <div className={styles.skeletonLine} style={{ width: '65%' }} />
              <div className={styles.aiTag}>
                <div className={styles.aiTagDot} />
                AI Summarizing...
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Stats Strip ──────────────────────────────────────────────────────────────
const StatsStrip = () => {
  const ref = useReveal();
  const stats = [
    { num: '142K+', label: 'Calls Analyzed Daily' },
    { num: '98.2%', label: 'AI Accuracy Rate' },
    { num: '<80ms', label: 'Avg API Latency' },
  ];

  return (
    <div className={`${styles.statsStrip} reveal`} ref={ref}>
      {stats.map((s, i) => (
        <div key={i} className={styles.statItem} style={{ transitionDelay: `${i * 0.1}s` }}>
          <div className={styles.statNum}>{s.num}</div>
          <div className={styles.statLabel}>{s.label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Features ─────────────────────────────────────────────────────────────────
const FEATURE_DATA = [
  {
    icon: Bot,
    title: 'LLM Call Analysis',
    desc: 'Our proprietary pipeline transcribes and analyzes every call using GPT-4o, extracting sentiment, intent, and next steps in milliseconds.',
    large: true,
    hasVisual: true,
  },
  {
    icon: MessageSquare,
    title: 'Auto WhatsApp',
    desc: 'Trigger intelligent follow-ups based on AI insights the moment a call ends.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    desc: 'Bank-grade AES-256 encryption for all call data, logs, and API keys.',
  },
  {
    icon: Globe,
    title: 'Global Edge',
    desc: 'Edge nodes in 24+ regions delivering <80ms API response worldwide.',
  },
  {
    icon: TrendingUp,
    title: 'Full Observability',
    desc: 'Monitor your entire lead lifecycle with real-time metrics, distributed tracing, and auto-recovery.',
  },
];

// ─── Single Bento Card (hooks must be at component top level) ────────────────
const BentoCard = ({ feat, index }) => {
  const cardRef = useReveal();
  const Icon = feat.icon;
  return (
    <div
      className={`${styles.bentoCard} ${feat.large ? styles.large : ''} reveal`}
      ref={cardRef}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      <div className="corner-tl" />
      <div className={styles.cardIconWrap}>
        <Icon size={20} />
      </div>
      <h3>{feat.title}</h3>
      <p>{feat.desc}</p>
      {feat.hasVisual && (
        <div className={styles.cardVisual}>
          <div className={styles.bar} style={{ width: '100%' }} />
          <div className={styles.bar} style={{ width: '85%' }} />
          <div className={styles.bar} style={{ width: '70%' }} />
        </div>
      )}
    </div>
  );
};

// ─── Features ─────────────────────────────────────────────────────────────────
const BentoFeatures = () => {
  const titleRef = useReveal();

  return (
    <section id="features" className={styles.features}>
      <div className="reveal" ref={titleRef}>
        <div className={styles.sectionEyebrow}>Core Features</div>
        <h2 className={styles.sectionTitle}>
          Everything you need to <br />
          <span style={{ color: 'var(--text-dim)' }}>scale conversion</span>
        </h2>
      </div>

      <div className={styles.bentoGrid}>
        {FEATURE_DATA.map((feat, i) => (
          <BentoCard key={i} feat={feat} index={i} />
        ))}
      </div>
    </section>
  );
};

// ─── API Section ──────────────────────────────────────────────────────────────
const ApiSection = () => {
  const [activeTab, setActiveTab] = useState('POST /calls');
  const [animated, setAnimated] = useState(false);
  const leftRef = useReveal();
  const rightRef = useReveal();

  const handleTab = (tab) => {
    setAnimated(false);
    setTimeout(() => { setActiveTab(tab); setAnimated(true); }, 10);
  };

  useEffect(() => { setAnimated(true); }, [activeTab]);

  return (
    <section id="api" className={styles.api}>
      <div className={styles.apiGrid}>
        <div className={`reveal-left`} ref={leftRef}>
          <div className={styles.sectionEyebrow}>Developer-First</div>
          <h2 className={styles.sectionTitle}>Clean REST API</h2>
          <p className={styles.apiDescription}>
            Integrate our lead engine into your existing stack with just a few lines.
            No bloated SDKs—just clean, predictable REST endpoints with sub-100ms P95.
          </p>
          <ul className={styles.apiPoints}>
            {Object.keys(API_SNIPPETS).map(tab => (
              <li
                key={tab}
                className={activeTab === tab ? styles.active : ''}
                onClick={() => handleTab(tab)}
              >
                <ChevronRight size={16} />
                {tab === 'POST /calls' ? 'Call Logging' : tab === 'GET /leads' ? 'Lead Retrieval' : 'Webhook Events'}
              </li>
            ))}
          </ul>
        </div>

        <div className={`reveal-right`} ref={rightRef} style={{ transitionDelay: '0.15s' }}>
          <div className={styles.editorFrame}>
            <div className="scan-line" />
            <div className={styles.editorTopBar}>
              <div className={styles.editorDots}>
                <span /><span /><span />
              </div>
              <div className={styles.tabList}>
                {Object.keys(API_SNIPPETS).map(tab => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                    onClick={() => handleTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.editorBody}>
              <div className={styles.editorTitle}>{API_SNIPPETS[activeTab].title}</div>
              <pre
                className={styles.codeBlock}
                style={{
                  opacity: animated ? 1 : 0,
                  transform: animated ? 'translateY(0)' : 'translateY(6px)',
                  transition: 'opacity 0.25s ease, transform 0.25s ease'
                }}
              >
                <code>{API_SNIPPETS[activeTab].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerGrid}>
      <div>
        <div className={styles.footerLogo}>LeadPulse</div>
        <p className={styles.footerTagline}>The AI-powered backbone for modern sales teams.</p>
      </div>
      <div className={styles.footerLinks}>
        <div>
          <h4>Product</h4>
          <a href="#">Features</a>
          <a href="#">API Reference</a>
          <a href="#">Pricing</a>
          <a href="#">Changelog</a>
        </div>
        <div>
          <h4>Company</h4>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Security</a>
        </div>
      </div>
    </div>
    <div className={styles.footerBottom}>
      <span className={styles.footerCopy}>© 2026 LeadPulse AI, Inc.</span>
      <div className={styles.footerStatus}>
        <span className={`${styles.statusDot} glow-dot`} />
        All systems operational
      </div>
    </div>
  </footer>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
const LandingPage = ({ onEnterDashboard }) => {
  return (
    <div className={styles.container}>
      <div className="aurora-bg" />
      <Navbar onEnterDashboard={onEnterDashboard} />
      <main>
        <Hero onEnterDashboard={onEnterDashboard} />
        <StatsStrip />
        <BentoFeatures />
        <ApiSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
