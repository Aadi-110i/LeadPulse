import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  PhoneCall, 
  MessageCircle, 
  Activity, 
  Bell, 
  Search,
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  Filter,
  LogOut,
  ChevronRight,
  Settings,
  BookOpen,
  Eye,
  History,
  Clock,
  ArrowLeft,
  Brain,
  ShieldCheck,
  Zap,
  Globe,
  Cpu,
  Terminal,
  Server
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { LEADS, ACTIVITY } from '../../data/mockData';
import styles from './Dashboard.module.css';

const CHART_DATA = [
  { name: '00:00', calls: 400, followups: 240 },
  { name: '04:00', calls: 300, followups: 139 },
  { name: '08:00', calls: 600, followups: 980 },
  { name: '12:00', calls: 800, followups: 390 },
  { name: '16:00', calls: 500, followups: 480 },
  { name: '20:00', calls: 900, followups: 380 },
  { name: '23:59', calls: 700, followups: 430 },
];

const TelemetryNode = ({ label, value, subValue, icon: Icon }) => (
  <div className={`${styles.tacticalPanel} ${styles.kpiCard}`}>
    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
      <Icon size={14} color="#8b5cf6" />
      <span style={{fontSize: '0.5rem', opacity: 0.5}}>DATA_STREAMS_ACTIVE</span>
    </div>
    <span className={styles.kpiLabel}>{label}</span>
    <div className={styles.kpiValue}>{value}</div>
    <div style={{fontSize: '0.6rem', color: '#10B981', marginTop: '4px'}}>{subValue}</div>
  </div>
);

import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';

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

  const renderOverview = () => (
    <>
      {/* Column 1: Core Telemetry */}
      <div className={styles.leftColumn}>
        <TelemetryNode label="DATABASE_NODES" value="12,402" subValue="SYNC_STABLE" icon={Server} />
        <TelemetryNode label="ACTIVE_SESIONS" value="142" subValue="+12%_PEAK" icon={Activity} />
        <TelemetryNode label="AI_CORES_ACTIVE" value="138" subValue="THREAD_SAFE" icon={Brain} />
        <div className={styles.tacticalPanel} style={{flex: 1, padding: '16px'}}>
          <span className={styles.kpiLabel}>SYSTEM_LOG_DUMP</span>
          <div style={{fontSize: '0.6rem', color: '#64748b', fontFamily: 'var(--font-mono)', lineHeight: '1.4'}}>
            {`> kernel: boot secure
> auth: jwt_valid
> node_04: online
> ai_engine: ready
> socket: connected
> buffer: clear
> cluster: healthy`}
          </div>
        </div>
      </div>

      {/* Column 2: Operations Map & Primary Data */}
      <div className={styles.centerColumn}>
        <div className={`${styles.tacticalPanel} ${styles.chartCard}`}>
          <div className={styles.cardHeader}>
            <h3>NEURAL_ACTIVITY_MATRIX</h3>
            <div style={{display: 'flex', gap: '10px'}}>
              <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#8b5cf6'}}></div>
              <div style={{width: '6px', height: '6px', borderRadius: '50%', background: '#ec4899'}}></div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={CHART_DATA}>
              <defs>
                <linearGradient id="glowViolet" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 2" stroke="rgba(139, 92, 246, 0.1)" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip contentStyle={{background: '#010103', border: '1px solid #8b5cf6', fontSize: '10px'}} />
              <Area type="stepAfter" dataKey="calls" stroke="#8b5cf6" fill="url(#glowViolet)" strokeWidth={2} />
              <Area type="monotone" dataKey="followups" stroke="#ec4899" fill="transparent" strokeWidth={1} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className={`${styles.tacticalPanel} ${styles.tableCard}`}>
          <div className={styles.cardHeader}>
            <h3>DATA_SET_RECORDS</h3>
            <div className={styles.searchBar}>
              <Search size={12} />
              <input type="text" placeholder="FILTER_RECORDS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>ENITY_NAME</th>
                <th>STATUS_FLAG</th>
                <th>TRACE</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.slice(0, 5).map(lead => (
                <tr key={lead.id} style={{cursor: 'pointer'}} onClick={() => setSelectedLead(lead)}>
                  <td style={{color: '#8b5cf6', fontSize: '0.6rem'}}>#{lead.id}</td>
                  <td style={{color: '#fff', fontWeight: 600}}>{lead.name}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td><ArrowUpRight size={12} opacity={0.3} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Column 3: Pulse & Interactions */}
      <div className={styles.rightColumn}>
        <div className={`${styles.tacticalPanel} ${styles.activityCard}`}>
          <div className={styles.cardHeader}>
            <h3>REAL_TIME_PULSE</h3>
            <div style={{fontSize: '0.5rem', color: '#10B981'}}>● LIVE_SYNC</div>
          </div>
          <div className={styles.activityList}>
            {ACTIVITY.map(item => (
              <div key={item.id} className={styles.activityItem}>
                <div className={styles.activityDot}></div>
                <div className={styles.activityContent}>
                  <p style={{fontSize: '0.7rem', color: '#fff'}}>{item.msg.toUpperCase()}</p>
                  <span style={{fontSize: '0.55rem', opacity: 0.4}}>{item.time} // TRACE_OK</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.tacticalPanel} style={{height: '150px', background: 'repeating-linear-gradient(45deg, rgba(139, 92, 246, 0.02) 0px, rgba(139, 92, 246, 0.02) 2px, transparent 2px, transparent 4px)'}}>
          <div style={{padding: '20px', textAlign: 'center'}}>
            <Cpu size={32} color="#8b5cf6" opacity={0.2} style={{animation: 'dataPulse 2s infinite'}} />
            <div style={{fontSize: '0.6rem', letterSpacing: '0.2em', marginTop: '10px'}}>SECURITY_KERNEL_V4</div>
          </div>
        </div>
      </div>
    </>
  );

  const renderLeads = () => (
    <div className={styles.fullView}>
      <div className={styles.cardHeader}>
        <h2 style={{fontSize: '1rem', letterSpacing: '0.1em', color: 'white'}}>LEAD_INVENTORY_ROOT</h2>
        <button style={{background: '#8b5cf6', padding: '8px 16px', borderRadius: '8px', border: 'none', color: 'white', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.7rem'}}><Plus size={14} /> ADD_ENTRY</button>
      </div>
      <div className={styles.tacticalPanel} style={{padding: '24px'}}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>IDENTIFIER</th>
              <th>CONTACT_DATA</th>
              <th>STATUS</th>
              <th>AI_SUMMARY_HASH</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id}>
                <td style={{color: '#8b5cf6'}}>#{lead.id}</td>
                <td style={{color: '#fff'}}>{lead.name}<br/><span style={{fontSize: '0.65rem', opacity: 0.5}}>{lead.phone}</span></td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[lead.status]}`}>
                    {lead.status}
                  </span>
                </td>
                <td><div style={{maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.6, fontSize: '0.7rem'}}>{lead.summary}</div></td>
                <td>
                  <button style={{background: 'transparent', border: '1px solid rgba(139,92,246,0.3)', padding: '6px 12px', borderRadius: '4px', color: '#8b5cf6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.6rem'}} onClick={() => setSelectedLead(lead)}>
                    <Eye size={12} /> OPEN
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDocs = () => (
    <div className={styles.fullView}>
      <h2 style={{color: 'white', marginBottom: '30px'}}>API_INTERFACE_SPECIFICATIONS</h2>
      <div className={styles.leadDetailGrid}>
        <div className={styles.tacticalPanel} style={{padding: '30px'}}>
           <div style={{color: '#10B981', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginBottom: '10px'}}>POST /v1/dispatch/calls</div>
           <p style={{fontSize: '0.8rem', marginBottom: '20px'}}>Initialize a new neural call session and queue for AI summarization.</p>
           <pre style={{background: '#000', padding: '20px', borderRadius: '8px', border: '1px solid #1a1a2e', fontSize: '0.7rem'}}>
{`{
  "caller": "+1-555-0102",
  "priority": "high",
  "stream_url": "wss://pulse.io/live"
}`}
           </pre>
        </div>
        <div className={styles.tacticalPanel} style={{padding: '30px'}}>
          <h3 style={{fontSize: '0.7rem', marginBottom: '20px'}}>AUTHENTICATION</h3>
          <p style={{fontSize: '0.7rem', opacity: 0.6}}>All requests must include a Bearer JWT in the authorization header.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.nebula}></div>
      <div className={styles.gridOverlay}></div>

      <nav className={styles.commandDock}>
        <button 
          className={`${styles.navItem} ${activeTab === 'Overview' && !selectedLead ? styles.active : ''}`} 
          onClick={() => {setActiveTab('Overview'); setSelectedLead(null);}}
          title="Telemetry Overview"
        >
          <LayoutDashboard size={20} />
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'Leads' || selectedLead ? styles.active : ''}`} 
          onClick={() => {setActiveTab('Leads'); setSelectedLead(null);}}
          title="Data Inventory"
        >
          <Users size={20} />
        </button>
        <button 
          className={`${styles.navItem} ${activeTab === 'Docs' ? styles.active : ''}`} 
          onClick={() => {setActiveTab('Docs'); setSelectedLead(null);}}
          title="Interface Spec"
        >
          <BookOpen size={20} />
        </button>
        <div style={{width: '1px', background: 'rgba(255,255,255,0.1)', height: '24px', margin: '0 4px'}}></div>
        <button className={styles.navItem} onClick={onBackToLanding} title="Terminate Session">
          <LogOut size={20} color="#EF4444" />
        </button>
      </nav>
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>SYSTEM_TERMINAL::LEADPULSE_OS</h1>
            <p style={{fontSize: '0.6rem', color: '#64748b'}}>NODE: 04 // STATUS: SECURE // {activeTab.toUpperCase()}</p>
          </div>
          <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
            <div style={{fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#8b5cf6'}}>AUTH::SESSION_ACTIVE</div>
            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold', color: '#fff'}}>JD</div>
          </div>
        </header>
        
        {selectedLead ? (
          <div className={styles.fullView}>
            <button className={styles.backBtn} onClick={() => setSelectedLead(null)}>
              <ArrowLeft size={12} /> RETURN_TO_CLUSTER
            </button>
            <div className={styles.leadDetailGrid}>
              <div className={styles.tacticalPanel} style={{padding: '40px'}}>
                <h2 style={{color: '#fff', fontSize: '2rem', marginBottom: '10px'}}>{selectedLead.name}</h2>
                <p style={{color: '#8b5cf6', fontSize: '0.7rem', marginBottom: '30px'}}>{selectedLead.phone} // ENCRYPTED_LINK</p>
                <div className={styles.aiFullText}>{selectedLead.summary}</div>
              </div>
              <div className={styles.tacticalPanel} style={{padding: '30px'}}>
                <h3 style={{fontSize: '0.7rem', letterSpacing: '0.1em', marginBottom: '20px'}}>SESSION_ACTIONS</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '10px'}}>
                   <button style={{background: '#8b5cf6', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer'}}>COMMIT_CONVERSION</button>
                   <button style={{background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer'}}>SCHEDULE_TASK</button>
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
