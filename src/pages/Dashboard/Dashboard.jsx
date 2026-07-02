import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  ArrowUpRight,
  Plus,
  LogOut,
  Eye,
  ArrowLeft,
  Brain,
  Server,
  Home,
  Cpu,
  Search
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { LEADS, ACTIVITY } from '../../data/mockData';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import styles from './Dashboard.module.css';

// ─── Chart Data ───────────────────────────────────────────────────────────────
const CHART_DATA = [
  { name: '00:00', calls: 400, followups: 240 },
  { name: '04:00', calls: 300, followups: 139 },
  { name: '08:00', calls: 600, followups: 980 },
  { name: '12:00', calls: 800, followups: 390 },
  { name: '16:00', calls: 500, followups: 480 },
  { name: '20:00', calls: 900, followups: 380 },
  { name: '23:59', calls: 700, followups: 430 },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(4, 8, 16, 0.95)',
      border: '1px solid rgba(0, 212, 255, 0.2)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontFamily: 'var(--font-mono)',
      fontSize: '0.7rem',
    }}>
      <div style={{ color: 'var(--text-dim)', marginBottom: '6px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.stroke, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span>{p.name}:</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const TelemetryNode = ({ label, value, subValue, icon: Icon }) => (
  <div className={`${styles.tacticalPanel} ${styles.kpiCard}`}>
    <div className={styles.panelGlow} />
    <div className={styles.kpiHeader}>
      <Icon size={14} color="var(--cyan)" />
      <span className={styles.kpiTag}>STREAM_ACTIVE</span>
    </div>
    <span className={styles.kpiLabel}>{label}</span>
    <div className={styles.kpiValue}>{value}</div>
    <div className={styles.kpiSubValue}>{subValue}</div>
  </div>
);

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = ({ onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      onBackToLanding();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const filteredLeads = useMemo(() => {
    return LEADS.filter(lead =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  // ─── Overview ───────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <>
      {/* Left: KPI Telemetry */}
      <div className={styles.leftColumn}>
        <TelemetryNode label="DATABASE_NODES" value="12,402" subValue="↑ SYNC_STABLE" icon={Server} />
        <TelemetryNode label="ACTIVE_SESSIONS" value="142" subValue="↑ +12% PEAK" icon={Activity} />
        <TelemetryNode label="AI_CORES" value="138" subValue="● THREAD_SAFE" icon={Brain} />

        {/* System Log */}
        <div className={`${styles.tacticalPanel} ${styles.systemLog}`}>
          <div className={styles.panelGlow} />
          <div className={styles.cardHeader}>
            <h3>System Log</h3>
          </div>
          <div className={styles.logContent}>
            {[
              { text: '> kernel: boot secure', cls: 'ok' },
              { text: '> auth: jwt_valid', cls: 'ok' },
              { text: '> node_04: online', cls: 'info' },
              { text: '> ai_engine: ready', cls: 'ok' },
              { text: '> socket: connected', cls: 'info' },
              { text: '> buffer: clear', cls: 'ok' },
              { text: '> cluster: healthy', cls: 'ok' },
            ].map((l, i) => (
              <div
                key={i}
                className={`${styles.logLine} ${styles[l.cls]}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {l.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center: Chart + Table */}
      <div className={styles.centerColumn}>
        <div className={`${styles.tacticalPanel} ${styles.chartCard}`}>
          <div className={styles.panelGlow} />
          <div className={styles.cardHeader}>
            <h3>Neural Activity Matrix</h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.6rem' }}>
              <span style={{ color: 'var(--cyan)' }}>● Calls</span>
              <span style={{ color: 'var(--electric)', opacity: 0.7 }}>● Follow-ups</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="86%">
            <AreaChart data={CHART_DATA} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gElectric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F8EF7" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#4F8EF7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 6" stroke="rgba(0, 212, 255, 0.06)" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="calls" stroke="#00D4FF" strokeWidth={1.5} fill="url(#gCyan)" dot={false} />
              <Area type="monotone" dataKey="followups" stroke="#4F8EF7" strokeWidth={1.5} fill="url(#gElectric)" dot={false} strokeDasharray="5 4" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.tacticalPanel} ${styles.tableCard}`}>
          <div className={styles.panelGlow} />
          <div className={styles.cardHeader}>
            <h3>Lead Records</h3>
            <div className={styles.searchBar}>
              <Search size={11} />
              <input
                type="text"
                placeholder="Filter..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>→</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.slice(0, 5).map(lead => (
                <tr key={lead.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedLead(lead)}>
                  <td style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>#{lead.id}</td>
                  <td style={{ color: 'var(--text-bright)', fontWeight: 600 }}>{lead.name}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[lead.status]}`}>{lead.status}</span>
                  </td>
                  <td><ArrowUpRight size={13} color="var(--text-dim)" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: Activity + Mini Panel */}
      <div className={styles.rightColumn}>
        <div className={`${styles.tacticalPanel} ${styles.activityCard}`}>
          <div className={styles.panelGlow} />
          <div className={styles.cardHeader}>
            <h3>Real-Time Pulse</h3>
            <div className={styles.liveIndicator}>
              <span className={`${styles.liveDot} glow-dot`} />
              LIVE
            </div>
          </div>
          <div className={styles.activityList}>
            {ACTIVITY.map(item => (
              <div key={item.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityContent}>
                  <p>{item.msg}</p>
                  <span>{item.time} — TRACE_OK</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.tacticalPanel} ${styles.miniPanel}`}>
          <div className={styles.panelGlow} />
          <Cpu size={28} color="var(--cyan)" style={{ opacity: 0.3, animation: 'dataPulse 2.5s ease-in-out infinite' }} />
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            letterSpacing: '0.15em',
            color: 'var(--text-dim)',
            textAlign: 'center',
            lineHeight: 1.8
          }}>
            SECURITY<br />KERNEL_V4
          </div>
        </div>
      </div>
    </>
  );

  // ─── Leads View ─────────────────────────────────────────────────────────────
  const renderLeads = () => (
    <div className={styles.fullView}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-bright)', letterSpacing: '-0.02em' }}>
            Lead Inventory
          </h2>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '4px' }}>
            {filteredLeads.length} records found
          </p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: '7px',
          background: 'linear-gradient(135deg, var(--cyan), var(--electric))',
          color: 'var(--bg-void)', padding: '10px 18px', borderRadius: '10px',
          border: 'none', fontFamily: 'var(--font-display)', fontSize: '0.8rem',
          fontWeight: 700, cursor: 'pointer',
        }}>
          <Plus size={14} /> Add Lead
        </button>
      </div>

      <div className={styles.tacticalPanel} style={{ padding: '24px' }}>
        <div className={styles.panelGlow} />
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Contact</th>
              <th>Status</th>
              <th>AI Summary</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id}>
                <td style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>#{lead.id}</td>
                <td>
                  <div style={{ color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.85rem' }}>{lead.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: 'var(--text-dim)', marginTop: '2px' }}>{lead.phone}</div>
                </td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[lead.status]}`}>{lead.status}</span>
                </td>
                <td>
                  <div style={{ maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-main)', fontSize: '0.78rem' }}>
                    {lead.summary}
                  </div>
                </td>
                <td>
                  <button
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: 'transparent', border: '1px solid rgba(0, 212, 255, 0.2)',
                      borderRadius: '6px', padding: '6px 12px', color: 'var(--cyan)',
                      fontFamily: 'var(--font-mono)', fontSize: '0.65rem', cursor: 'pointer',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,212,255,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <Eye size={11} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ─── Docs View ──────────────────────────────────────────────────────────────
  const renderDocs = () => (
    <div className={styles.fullView}>
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '24px', letterSpacing: '-0.02em' }}>
        API Specifications
      </h2>
      <div className={styles.docsGrid}>
        <div className={styles.tacticalPanel} style={{ padding: '32px' }}>
          <div className={styles.panelGlow} />
          <div className={styles.endpointMethod}>POST /v1/dispatch/calls</div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '16px', lineHeight: 1.7 }}>
            Initialize a new call session and queue it for AI summarization.
          </p>
          <pre className={styles.codeSnippet}>
{`{
  "caller": "+1-555-0102",
  "priority": "high",
  "stream_url": "wss://pulse.io/live"
}`}
          </pre>
        </div>
        <div className={styles.tacticalPanel} style={{ padding: '32px' }}>
          <div className={styles.panelGlow} />
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-bright)', marginBottom: '16px', fontWeight: 600 }}>
            Authentication
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.7 }}>
            All requests must include a Bearer JWT in the <code style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>Authorization</code> header.
          </p>
        </div>
      </div>
    </div>
  );

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.nebula} />
      <div className={styles.gridOverlay} />

      {/* Command Dock */}
      <nav className={styles.commandDock}>
        <button
          className={`${styles.navItem} ${activeTab === 'Overview' && !selectedLead ? styles.active : ''}`}
          onClick={() => { setActiveTab('Overview'); setSelectedLead(null); }}
          title="Overview"
        >
          <LayoutDashboard size={19} />
        </button>
        <button
          className={`${styles.navItem} ${(activeTab === 'Leads' || selectedLead) ? styles.active : ''}`}
          onClick={() => { setActiveTab('Leads'); setSelectedLead(null); }}
          title="Leads"
        >
          <Users size={19} />
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'Docs' ? styles.active : ''}`}
          onClick={() => { setActiveTab('Docs'); setSelectedLead(null); }}
          title="API Docs"
        >
          <BookOpen size={19} />
        </button>
        <div className={styles.navDivider} />
        <button className={styles.navItem} onClick={onBackToLanding} title="Back Home">
          <Home size={19} color="var(--cyan)" />
        </button>
        <button className={styles.navItem} onClick={handleSignOut} title="Sign Out">
          <LogOut size={19} color="var(--rose)" />
        </button>
      </nav>

      {/* Main */}
      <main className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>LeadPulse OS // Terminal</h1>
            <p>NODE:04 — STATUS:SECURE — {selectedLead ? 'LEAD_DETAIL' : activeTab.toUpperCase()}</p>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.liveIndicator}>
              <span className={`${styles.liveDot} glow-dot`} />
              Session Active
            </div>
            <button className={styles.homeBtn} onClick={onBackToLanding}>
              <Home size={12} /> Home
            </button>
            <div className={styles.userAvatar}>JD</div>
          </div>
        </header>

        {/* Content */}
        {selectedLead ? (
          <div className={styles.fullView}>
            <button className={styles.backBtn} onClick={() => setSelectedLead(null)}>
              <ArrowLeft size={12} /> Back to List
            </button>
            <div className={styles.leadDetailGrid}>
              <div className={styles.tacticalPanel} style={{ padding: '40px' }}>
                <div className={styles.panelGlow} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-bright)', marginBottom: '6px', letterSpacing: '-0.04em' }}>
                  {selectedLead.name}
                </h2>
                <p style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan)', fontSize: '0.72rem', marginBottom: '28px', opacity: 0.8 }}>
                  {selectedLead.phone} — ENCRYPTED_LINK
                </p>
                <div className={styles.aiFullText}>{selectedLead.summary}</div>
              </div>
              <div className={styles.tacticalPanel} style={{ padding: '32px' }}>
                <div className={styles.panelGlow} />
                <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
                  Actions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button className={styles.actionBtn}>Commit Conversion</button>
                  <button className={styles.actionBtnSecondary}>Schedule Follow-up</button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Leads' && renderLeads()}
            {activeTab === 'Docs' && renderDocs()}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
