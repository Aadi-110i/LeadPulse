import React, { useState } from 'react';
import { 
  Brain, 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Activity, 
  Code2, 
  ArrowRight, 
  Terminal,
  Cpu,
  Globe,
  Lock,
  Search,
  ChevronRight,
  GitBranch
} from 'lucide-react';
import { FEATURES, STATS } from '../../data/mockData';
import styles from './LandingPage.module.css';

const IconMap = {
  Brain: Cpu,
  MessageSquare: MessageSquare,
  BarChart3: BarChart3,
  Zap: Zap,
  Activity: Activity,
  Code2: Terminal
};

const API_SNIPPETS = {
  'POST /calls': {
    title: 'Log a new call',
    code: `const response = await fetch('https://api.leadpulse.io/v1/calls', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer LP_KEY_92...' },
  body: JSON.stringify({
    caller: "+15550102",
    duration: 145,
    audio_url: "s3://recordings/call_92.mp3"
  })
});`
  },
  'GET /leads': {
    title: 'Retrieve AI leads',
    code: `const leads = await fetch('https://api.leadpulse.io/v1/leads?status=new', {
  headers: { 'Authorization': 'Bearer LP_KEY_92...' }
});

const data = await leads.json();
// Returns structured JSON with AI summaries`
  },
  'WEBHOOK /followup': {
    title: 'Automated triggers',
    code: `{
  "event": "followup.sent",
  "lead_id": "lead_9283",
  "channel": "whatsapp",
  "ai_summary": "Customer interested in bulk pricing.",
  "timestamp": "2024-05-12T10:30:00Z"
}`
  }
};

const Navbar = ({ onEnterDashboard }) => (
  <nav className={styles.navbar}>
    <div className={styles.navBrand}>
      <div className={styles.logoMark}>
        <div className={styles.logoInner}></div>
      </div>
      <span className={styles.logoText}>LeadPulse</span>
    </div>
    <div className={styles.navLinks}>
      <a href="#features" className={styles.navLink}>Features</a>
      <a href="#api" className={styles.navLink}>API Docs</a>
      <a href="#pricing" className={styles.navLink}>Pricing</a>
    </div>
    <div className={styles.navActions}>
      <button className={styles.btnSecondary} onClick={onEnterDashboard}>Sign In</button>
      <button className={styles.btnPrimary} onClick={onEnterDashboard}>
        Get API Access <ArrowRight size={16} />
      </button>
    </div>
  </nav>
);

const Hero = () => (
  <header className={styles.hero}>
    <div className={styles.heroGlow}></div>
    <div className={styles.heroContent}>
      <div className={`${styles.badge} fade-in`}>
        <span className={styles.badgePulse}></span>
        Next-Gen Lead Management
      </div>
      <h1 className="fade-in" style={{ animationDelay: '0.1s' }}>
        Automate your sales <br />
        <span className={styles.gradientText}>with AI-First APIs</span>
      </h1>
      <p className="fade-in" style={{ animationDelay: '0.2s' }}>
        Log calls, extract intent via LLMs, and trigger automated WhatsApp follow-ups. Built for high-performance sales teams who live in the code.
      </p>
      <div className={`${styles.heroActions} fade-in`} style={{ animationDelay: '0.3s' }}>
        <button className={styles.btnLarge}>Start Building Now</button>
        <button className={styles.btnGhost}>View Documentation</button>
      </div>
    </div>
    <div className={`${styles.heroVisual} fade-in`} style={{ animationDelay: '0.4s' }}>
      <div className={styles.visualContainer}>
        <div className={styles.visualCard}>
          <div className={styles.cardHeader}>
            <div className={styles.dots}><span></span><span></span><span></span></div>
            <span>Lead Intelligence</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.line}></div>
            <div className={styles.line} style={{ width: '80%' }}></div>
            <div className={styles.line} style={{ width: '60%' }}></div>
            <div className={styles.aiTag}>AI Summarizing...</div>
          </div>
        </div>
        <div className={styles.visualOrb}></div>
      </div>
    </div>
  </header>
);

const BentoFeatures = () => (
  <section id="features" className={styles.features}>
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>Everything you need <br /> to scale conversion</h2>
    </div>
    <div className={styles.bentoGrid}>
      <div className={`${styles.bentoCard} ${styles.large} glass-panel fade-in`}>
        <div className={styles.cardIcon}><Cpu size={32} /></div>
        <h3>LLM Call Analysis</h3>
        <p>Our proprietary pipeline transcribes and analyzes every call using GPT-4o, extracting sentiment, intent, and next steps in milliseconds.</p>
        <div className={styles.cardVisual}>
          {/* Mock analysis visualization */}
          <div className={styles.bar}></div>
          <div className={styles.bar} style={{ width: '90%' }}></div>
          <div className={styles.bar} style={{ width: '75%' }}></div>
        </div>
      </div>
      <div className={`${styles.bentoCard} glass-panel fade-in`} style={{ animationDelay: '0.1s' }}>
        <div className={styles.cardIcon}><MessageSquare size={24} /></div>
        <h3>Auto WhatsApp</h3>
        <p>Trigger follow-ups based on AI insights instantly.</p>
      </div>
      <div className={`${styles.bentoCard} glass-panel fade-in`} style={{ animationDelay: '0.2s' }}>
        <div className={styles.cardIcon}><Lock size={24} /></div>
        <h3>Enterprise Security</h3>
        <p>Bank-grade encryption for all call data and logs.</p>
      </div>
      <div className={`${styles.bentoCard} glass-panel fade-in`} style={{ animationDelay: '0.3s' }}>
        <div className={styles.cardIcon}><Globe size={24} /></div>
        <h3>Global Scale</h3>
        <p>Edge nodes in 20+ regions for low-latency API access.</p>
      </div>
      <div className={`${styles.bentoCard} ${styles.medium} glass-panel fade-in`} style={{ animationDelay: '0.4s' }}>
        <div className={styles.cardIcon}><Activity size={24} /></div>
        <h3>Full Observability</h3>
        <p>Monitor your entire lead lifecycle with real-time logs, tracing, and automated error recovery.</p>
      </div>
    </div>
  </section>
);

const ApiSection = () => {
  const [activeTab, setActiveTab] = useState('POST /calls');

  return (
    <section id="api" className={styles.api}>
      <div className={styles.apiGrid}>
        <div className={styles.apiContent}>
          <h2 className={styles.sectionTitle}>Developer-First API</h2>
          <p>Integrate our lead engine into your existing stack with just a few lines of code. No heavy SDKs, just clean REST endpoints.</p>
          <ul className={styles.apiPoints}>
            <li className={activeTab === 'POST /calls' ? styles.active : ''} onClick={() => setActiveTab('POST /calls')}>
              <ChevronRight size={18} /> Call Logging
            </li>
            <li className={activeTab === 'GET /leads' ? styles.active : ''} onClick={() => setActiveTab('GET /leads')}>
              <ChevronRight size={18} /> Lead Retrieval
            </li>
            <li className={activeTab === 'WEBHOOK /followup' ? styles.active : ''} onClick={() => setActiveTab('WEBHOOK /followup')}>
              <ChevronRight size={18} /> Webhook Events
            </li>
          </ul>
        </div>
        <div className={styles.apiVisual}>
          <div className={styles.editorFrame}>
            <div className={styles.editorHeader}>
              <div className={styles.tabList}>
                {Object.keys(API_SNIPPETS).map(tab => (
                  <button 
                    key={tab}
                    className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.editorBody}>
              <div className={styles.editorTitle}>{API_SNIPPETS[activeTab].title}</div>
              <pre className={styles.codeBlock}>
                <code>{API_SNIPPETS[activeTab].code}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className={styles.footer}>
    <div className={styles.footerGrid}>
      <div className={styles.footerInfo}>
        <div className={styles.footerLogo}>LeadPulse</div>
        <p>The AI-powered backbone for modern sales teams.</p>
      </div>
      <div className={styles.footerLinks}>
        <div>
          <h4>Product</h4>
          <a href="#">Features</a>
          <a href="#">API</a>
          <a href="#">Pricing</a>
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
        </div>
      </div>
    </div>
    <div className={styles.footerBottom}>
      <span>&copy; 2026 LeadPulse AI.</span>
      <div className={styles.footerSocial}>
        <GitBranch size={18} />
      </div>
    </div>
  </footer>
);

const LandingPage = ({ onEnterDashboard }) => {
  return (
    <div className={styles.container}>
      <Navbar onEnterDashboard={onEnterDashboard} />
      <main>
        <Hero />
        <BentoFeatures />
        <ApiSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
