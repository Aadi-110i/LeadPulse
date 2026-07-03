import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Activity,
  ArrowRight,
  Globe,
  Lock,
  ChevronRight,
  Shield,
  TrendingUp,
  Phone,
  Bot,
  Check,
  X,
  Zap,
  Building2,
  Rocket,
  BookOpen,
  Terminal,
  Key,
  Webhook,
  ArrowUpRight,
  Copy,
  CheckCheck,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px', ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Smooth scroll util ───────────────────────────────────────────────────────
const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

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
      <div className={styles.navBrand} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <div className={styles.logoMark}>
          <div className={styles.logoInner} />
        </div>
        <span className={styles.logoText}>Lead<span>Pulse</span></span>
      </div>

      <div className={styles.navLinks}>
        <button className={styles.navLink} onClick={() => scrollTo('features')}>Features</button>
        <button className={styles.navLink} onClick={() => scrollTo('api')}>API</button>
        <button className={styles.navLink} onClick={() => scrollTo('pricing')}>Pricing</button>
        <button className={styles.navLink} onClick={() => scrollTo('docs')}>Docs</button>
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
      if (i <= fullText.length) { setTyped(fullText.slice(0, i)); i++; }
      else clearInterval(timer);
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
          <span className={styles.gradientText}>{typed}</span>
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
          <button className={styles.btnGhost} onClick={() => scrollTo('docs')}>
            View Docs
          </button>
        </div>
      </div>

      <div className={`${styles.heroVisual} reveal-right`} ref={visualRef} style={{ transitionDelay: '0.15s' }}>
        <div className={styles.visualContainer}>
          <div className={styles.visualOrb} />
          <div className={`${styles.floatingTag} ${styles.tag1}`}>
            <Activity size={12} /><span>AI Score: 94%</span>
          </div>
          <div className={`${styles.floatingTag} ${styles.tag2}`}>
            <Phone size={12} /><span>12 calls analyzed</span>
          </div>
          <div className={styles.visualCard}>
            <div className={styles.cardGlowLine} />
            <div className="corner-tl" /><div className="corner-br" />
            <div className={styles.cardHeader}>
              <div className={styles.dots}><span /><span /><span /></div>
              <span className={styles.cardHeaderTitle}>Lead Intelligence</span>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.skeletonLine} style={{ width: '100%' }} />
              <div className={styles.skeletonLine} style={{ width: '80%' }} />
              <div className={styles.skeletonLine} style={{ width: '65%' }} />
              <div className={styles.aiTag}>
                <div className={styles.aiTagDot} />AI Summarizing...
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
  { icon: Bot, title: 'LLM Call Analysis', desc: 'Our proprietary pipeline transcribes and analyzes every call using GPT-4o, extracting sentiment, intent, and next steps in milliseconds.', large: true, hasVisual: true },
  { icon: MessageSquare, title: 'Auto WhatsApp', desc: 'Trigger intelligent follow-ups based on AI insights the moment a call ends.' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade AES-256 encryption for all call data, logs, and API keys.' },
  { icon: Globe, title: 'Global Edge', desc: 'Edge nodes in 24+ regions delivering <80ms API response worldwide.' },
  { icon: TrendingUp, title: 'Full Observability', desc: 'Monitor your entire lead lifecycle with real-time metrics, distributed tracing, and auto-recovery.' },
];

const BentoCard = ({ feat, index }) => {
  const cardRef = useReveal();
  const Icon = feat.icon;
  return (
    <div className={`${styles.bentoCard} ${feat.large ? styles.large : ''} reveal`} ref={cardRef} style={{ transitionDelay: `${index * 0.08}s` }}>
      <div className="corner-tl" />
      <div className={styles.cardIconWrap}><Icon size={20} /></div>
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

const BentoFeatures = () => {
  const titleRef = useReveal();
  return (
    <section id="features" className={styles.features}>
      <div className="reveal" ref={titleRef}>
        <div className={styles.sectionEyebrow}>Core Features</div>
        <h2 className={styles.sectionTitle}>Everything you need to <br /><span style={{ color: 'var(--text-dim)' }}>scale conversion</span></h2>
      </div>
      <div className={styles.bentoGrid}>
        {FEATURE_DATA.map((feat, i) => <BentoCard key={i} feat={feat} index={i} />)}
      </div>
    </section>
  );
};

// ─── API Section ──────────────────────────────────────────────────────────────
const ApiSection = () => {
  const [activeTab, setActiveTab] = useState('POST /calls');
  const [animated, setAnimated] = useState(true);
  const [copied, setCopied] = useState(false);
  const leftRef = useReveal();
  const rightRef = useReveal();

  const handleTab = (tab) => {
    setAnimated(false);
    setTimeout(() => { setActiveTab(tab); setAnimated(true); }, 120);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(API_SNIPPETS[activeTab].code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section id="api" className={styles.api}>
      <div className={styles.apiGrid}>
        <div className="reveal-left" ref={leftRef}>
          <div className={styles.sectionEyebrow}>Developer-First</div>
          <h2 className={styles.sectionTitle}>Clean REST API</h2>
          <p className={styles.apiDescription}>
            Integrate our lead engine into your existing stack with just a few lines.
            No bloated SDKs — just clean, predictable REST endpoints with sub-100ms P95.
          </p>
          <ul className={styles.apiPoints}>
            {Object.keys(API_SNIPPETS).map(tab => (
              <li key={tab} className={activeTab === tab ? styles.active : ''} onClick={() => handleTab(tab)}>
                <ChevronRight size={16} />
                {tab === 'POST /calls' ? 'Call Logging' : tab === 'GET /leads' ? 'Lead Retrieval' : 'Webhook Events'}
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal-right" ref={rightRef} style={{ transitionDelay: '0.15s' }}>
          <div className={styles.editorFrame}>
            <div className="scan-line" />
            <div className={styles.editorTopBar}>
              <div className={styles.editorDots}><span /><span /><span /></div>
              <div className={styles.tabList}>
                {Object.keys(API_SNIPPETS).map(tab => (
                  <button key={tab} className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`} onClick={() => handleTab(tab)}>
                    {tab}
                  </button>
                ))}
              </div>
              <button className={styles.copyBtn} onClick={handleCopy} title="Copy code">
                {copied ? <CheckCheck size={14} color="var(--emerald)" /> : <Copy size={14} />}
              </button>
            </div>
            <div className={styles.editorBody}>
              <div className={styles.editorTitle}>{API_SNIPPETS[activeTab].title}</div>
              <pre className={styles.codeBlock} style={{ opacity: animated ? 1 : 0, transform: animated ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.25s ease, transform 0.25s ease' }}>
                <code>{API_SNIPPETS[activeTab].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Pricing Section ──────────────────────────────────────────────────────────
const PLANS = [
  {
    icon: Rocket,
    name: 'Starter',
    price: 'Free',
    period: 'forever',
    desc: 'Perfect for indie devs and small teams getting started.',
    highlight: false,
    cta: 'Start for Free',
    features: [
      { text: '500 calls / month', included: true },
      { text: 'AI call summaries', included: true },
      { text: 'REST API access', included: true },
      { text: 'WhatsApp follow-ups', included: false },
      { text: 'Webhook events', included: false },
      { text: 'Team seats', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    icon: Zap,
    name: 'Pro',
    price: '$49',
    period: 'per month',
    desc: 'For growing sales teams that need full AI power and automation.',
    highlight: true,
    badge: 'Most Popular',
    cta: 'Start Pro Trial',
    features: [
      { text: '10,000 calls / month', included: true },
      { text: 'AI call summaries', included: true },
      { text: 'REST API access', included: true },
      { text: 'WhatsApp follow-ups', included: true },
      { text: 'Webhook events', included: true },
      { text: '5 team seats', included: true },
      { text: 'Priority support', included: false },
    ],
  },
  {
    icon: Building2,
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    desc: 'Dedicated infrastructure, SLAs, and white-glove onboarding.',
    highlight: false,
    cta: 'Contact Sales',
    features: [
      { text: 'Unlimited calls', included: true },
      { text: 'AI call summaries', included: true },
      { text: 'REST API access', included: true },
      { text: 'WhatsApp follow-ups', included: true },
      { text: 'Webhook events', included: true },
      { text: 'Unlimited team seats', included: true },
      { text: 'Dedicated support & SLA', included: true },
    ],
  },
];

const PricingCard = ({ plan, index, onEnterDashboard }) => {
  const ref = useReveal();
  const Icon = plan.icon;
  return (
    <div
      className={`${styles.pricingCard} ${plan.highlight ? styles.pricingHighlight : ''} reveal`}
      ref={ref}
      style={{ transitionDelay: `${index * 0.1}s` }}
    >
      {plan.badge && <div className={styles.pricingBadge}>{plan.badge}</div>}
      <div className={styles.pricingCardTop}>
        <div className={`${styles.pricingIcon} ${plan.highlight ? styles.pricingIconHighlight : ''}`}>
          <Icon size={20} />
        </div>
        <div className={styles.planName}>{plan.name}</div>
        <div className={styles.planPrice}>
          <span className={styles.priceAmount}>{plan.price}</span>
          <span className={styles.pricePeriod}>{plan.period}</span>
        </div>
        <p className={styles.planDesc}>{plan.desc}</p>
      </div>
      <ul className={styles.featureList}>
        {plan.features.map((f, i) => (
          <li key={i} className={`${styles.featureItem} ${!f.included ? styles.featureDisabled : ''}`}>
            {f.included
              ? <Check size={14} color="var(--emerald)" />
              : <X size={14} color="var(--text-dim)" />}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      <button
        className={plan.highlight ? styles.pricingBtnHighlight : styles.pricingBtn}
        onClick={onEnterDashboard}
      >
        {plan.cta} <ArrowRight size={15} />
      </button>
    </div>
  );
};

const PricingSection = ({ onEnterDashboard }) => {
  const titleRef = useReveal();
  return (
    <section id="pricing" className={styles.pricing}>
      <div className="reveal" ref={titleRef}>
        <div className={styles.sectionEyebrow}>Pricing</div>
        <h2 className={styles.sectionTitle}>Simple, transparent pricing</h2>
        <p className={styles.pricingSubtitle}>No hidden fees. No credit card required to start. Cancel anytime.</p>
      </div>
      <div className={styles.pricingGrid}>
        {PLANS.map((plan, i) => (
          <PricingCard key={i} plan={plan} index={i} onEnterDashboard={onEnterDashboard} />
        ))}
      </div>
    </section>
  );
};

// ─── Docs Section ─────────────────────────────────────────────────────────────
const DOC_SECTIONS = [
  {
    icon: Key,
    title: 'Authentication',
    id: 'auth',
    content: `All API requests must include your API key in the Authorization header using Bearer token scheme.`,
    code: `// Add to every request header
Authorization: Bearer LP_KEY_xxxxxxxxxxxx

// Generate a key in your dashboard → Settings → API Keys
// Keys are scoped: read, write, or admin`,
  },
  {
    icon: Terminal,
    title: 'Quick Start',
    id: 'quickstart',
    content: `Get up and running in under 5 minutes. Install the SDK or use raw HTTP — your call.`,
    code: `# 1. Get your API key from the dashboard
# 2. Make your first call:

curl -X POST https://api.leadpulse.io/v1/calls \\
  -H "Authorization: Bearer LP_KEY_••••" \\
  -H "Content-Type: application/json" \\
  -d '{"caller":"+15550102","duration":145}'

# → Response: { "id": "call_9x2", "status": "processing" }`,
  },
  {
    icon: Webhook,
    title: 'Webhooks',
    id: 'webhooks',
    content: `Register webhook endpoints to receive real-time events when leads update, calls complete, or follow-ups fire.`,
    code: `// POST your-server.com/webhook
// LeadPulse will send:
{
  "event": "call.analyzed",
  "call_id": "call_9x2",
  "lead_score": 87,
  "intent": "purchase_intent",
  "summary": "Lead asked about bulk pricing.",
  "next_action": "whatsapp_followup"
}`,
  },
  {
    icon: BookOpen,
    title: 'Rate Limits',
    id: 'ratelimits',
    content: `API rate limits are applied per API key. Exceeding limits returns HTTP 429. Upgrade your plan for higher limits.`,
    code: `// Response headers on every request:
X-RateLimit-Limit:     1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset:     1720742400

// On 429 Too Many Requests:
{
  "error": "rate_limit_exceeded",
  "retry_after": 30
}`,
  },
];

const DocCard = ({ doc, index }) => {
  const ref = useReveal();
  const [open, setOpen] = useState(index === 0);
  const [copied, setCopied] = useState(false);
  const Icon = doc.icon;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(doc.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`${styles.docCard} reveal`} ref={ref} style={{ transitionDelay: `${index * 0.08}s` }}>
      <button className={styles.docCardHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.docCardTitle}>
          <div className={styles.docIcon}><Icon size={16} /></div>
          <span>{doc.title}</span>
        </div>
        <ChevronDown size={16} className={`${styles.docChevron} ${open ? styles.docChevronOpen : ''}`} />
      </button>
      {open && (
        <div className={styles.docCardBody}>
          <p className={styles.docDesc}>{doc.content}</p>
          <div className={styles.docCodeWrap}>
            <div className={styles.docCodeHeader}>
              <span className={styles.docCodeLabel}>Example</span>
              <button className={styles.docCopyBtn} onClick={handleCopy}>
                {copied ? <><CheckCheck size={12} color="var(--emerald)" /> Copied</> : <><Copy size={12} /> Copy</>}
              </button>
            </div>
            <pre className={styles.docCode}><code>{doc.code}</code></pre>
          </div>
        </div>
      )}
    </div>
  );
};

const DocsSection = ({ onEnterDashboard }) => {
  const titleRef = useReveal();
  const ctaRef = useReveal();
  return (
    <section id="docs" className={styles.docs}>
      <div className="reveal" ref={titleRef}>
        <div className={styles.sectionEyebrow}>Documentation</div>
        <h2 className={styles.sectionTitle}>Everything you need<br /><span style={{ color: 'var(--text-dim)' }}>to integrate fast</span></h2>
        <p className={styles.docsSubtitle}>
          Comprehensive reference for every endpoint, webhook, and SDK method. Built for developers, by developers.
        </p>
      </div>

      <div className={styles.docsLayout}>
        <div className={styles.docsCards}>
          {DOC_SECTIONS.map((doc, i) => <DocCard key={doc.id} doc={doc} index={i} />)}
        </div>

        <div className={`${styles.docsSidebar} reveal-right`}>
          <div className={styles.sidebarCard}>
            <div className="corner-tl" /><div className="corner-br" />
            <div className={styles.sidebarTitle}>API Reference</div>
            <ul className={styles.sidebarLinks}>
              {[
                ['POST /v1/calls', 'Log a call'],
                ['GET /v1/leads', 'List leads'],
                ['GET /v1/leads/:id', 'Get lead detail'],
                ['PATCH /v1/leads/:id', 'Update lead status'],
                ['DELETE /v1/calls/:id', 'Delete a call record'],
                ['POST /v1/webhooks', 'Register endpoint'],
                ['GET /v1/stats', 'Usage statistics'],
              ].map(([endpoint, label]) => (
                <li key={endpoint} className={styles.sidebarLink}>
                  <ArrowUpRight size={12} />
                  <div>
                    <div className={styles.sidebarEndpoint}>{endpoint}</div>
                    <div className={styles.sidebarEndpointLabel}>{label}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.sidebarCta} reveal`} ref={ctaRef}>
            <div className={styles.sidebarCtaTitle}>Ready to build?</div>
            <p className={styles.sidebarCtaDesc}>Get your API key and start in minutes.</p>
            <button className={styles.sidebarCtaBtn} onClick={onEnterDashboard}>
              Open Dashboard <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Footer ───────────────────────────────────────────────────────────────────
const Footer = ({ onEnterDashboard }) => (
  <footer className={styles.footer}>
    <div className={styles.footerGrid}>
      <div>
        <div className={styles.footerLogo}>LeadPulse</div>
        <p className={styles.footerTagline}>The AI-powered backbone for modern sales teams.</p>
      </div>
      <div className={styles.footerLinks}>
        <div>
          <h4>Product</h4>
          <button onClick={() => scrollTo('features')}>Features</button>
          <button onClick={() => scrollTo('api')}>API Reference</button>
          <button onClick={() => scrollTo('pricing')}>Pricing</button>
          <button onClick={() => scrollTo('docs')}>Changelog</button>
        </div>
        <div>
          <h4>Developers</h4>
          <button onClick={() => scrollTo('docs')}>Documentation</button>
          <button onClick={() => scrollTo('api')}>API Explorer</button>
          <button onClick={() => scrollTo('docs')}>Webhooks</button>
        </div>
        <div>
          <h4>Company</h4>
          <button onClick={onEnterDashboard}>Dashboard</button>
          <button onClick={onEnterDashboard}>Sign Up</button>
          <button onClick={onEnterDashboard}>Sign In</button>
        </div>
      </div>
    </div>
    <div className={styles.footerBottom}>
      <span className={styles.footerCopy}>© 2026 LeadPulse AI, Inc. All rights reserved.</span>
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
        <PricingSection onEnterDashboard={onEnterDashboard} />
        <DocsSection onEnterDashboard={onEnterDashboard} />
      </main>
      <Footer onEnterDashboard={onEnterDashboard} />
    </div>
  );
};

export default LandingPage;
