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
  Settings
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
  { name: 'Mon', calls: 400, followups: 240 },
  { name: 'Tue', calls: 300, followups: 139 },
  { name: 'Wed', calls: 600, followups: 980 },
  { name: 'Thu', calls: 800, followups: 390 },
  { name: 'Fri', calls: 500, followups: 480 },
  { name: 'Sat', calls: 900, followups: 380 },
  { name: 'Sun', calls: 700, followups: 430 },
];

const Sidebar = ({ onBackToLanding }) => (
  <aside className={styles.sidebar}>
    <div className={styles.sidebarBrand} onClick={onBackToLanding}>
      <div className={styles.logoMark}>
        <div className={styles.logoInner}></div>
      </div>
      <span>LeadPulse</span>
    </div>
    
    <nav className={styles.sidebarNav}>
      <button className={`${styles.navItem} ${styles.active}`} aria-label="Overview">
        <LayoutDashboard size={20} /> <span>Overview</span>
      </button>
      <button className={styles.navItem} aria-label="Leads">
        <Users size={20} /> <span>Leads</span>
      </button>
      <button className={styles.navItem} aria-label="Calls">
        <PhoneCall size={20} /> <span>Calls</span>
      </button>
      <button className={styles.navItem} aria-label="WhatsApp Logs">
        <MessageCircle size={20} /> <span>WhatsApp</span>
      </button>
      <button className={styles.navItem} aria-label="Observability">
        <Activity size={20} /> <span>Analytics</span>
      </button>
    </nav>
    
    <div className={styles.sidebarFooter}>
      <button className={styles.navItem} aria-label="Settings">
        <Settings size={20} /> <span>Settings</span>
      </button>
      <button className={styles.navItem} onClick={onBackToLanding} aria-label="Logout">
        <LogOut size={20} /> <span>Sign Out</span>
      </button>
    </div>
  </aside>
);

const KpiCard = ({ label, value, trend, trendUp }) => (
  <div className={`${styles.kpiCard} glass-panel`}>
    <span className={styles.kpiLabel}>{label}</span>
    <div className={styles.kpiMain}>
      <span className={styles.kpiValue}>{value}</span>
      <span className={`${styles.kpiTrend} ${trendUp ? styles.trendUp : styles.trendDown}`}>
        {trendUp ? <ArrowUpRight size={14} /> : null} {trend}
      </span>
    </div>
  </div>
);

const LeadsTable = ({ filteredLeads }) => (
  <div className={`${styles.tableCard} glass-panel`} style={{ width: '100%', marginTop: '20px' }}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Lead</th>
          <th>Phone</th>
          <th>Status</th>
          <th>AI Summary</th>
        </tr>
      </thead>
      <tbody>
        {filteredLeads.map(lead => (
          <tr key={lead.id}>
            <td><span className={styles.leadName}>{lead.name}</span></td>
            <td><span className={styles.leadPhone}>{lead.phone}</span></td>
            <td>
              <span className={`${styles.statusBadge} ${styles[lead.status]}`}>
                {lead.status}
              </span>
            </td>
            <td><div className={styles.leadSummary} style={{ maxWidth: '400px', overflow: 'visible', whiteSpace: 'normal' }}>{lead.summary}</div></td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Dashboard = ({ onBackToLanding }) => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLeads = useMemo(() => {
    return LEADS.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Leads':
        return (
          <div className={`${styles.fullView} fade-in`}>
            <div className={styles.viewHeader}>
              <h2>Lead Management</h2>
              <button className={styles.addBtn}><Plus size={14} /> New Lead</button>
            </div>
            <LeadsTable searchTerm={searchTerm} filteredLeads={filteredLeads} />
          </div>
        );
      case 'Calls':
        return (
          <div className={`${styles.fullView} fade-in`}>
            <div className={styles.viewHeader}>
              <h2>Call Intelligence Logs</h2>
            </div>
            <div className={`${styles.tableCard} glass-panel`}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Call ID</th>
                    <th>Caller</th>
                    <th>Duration</th>
                    <th>AI Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td><code style={{color: 'var(--violet)'}}>#CAL-092{i}</code></td>
                      <td>+1 555-019{i}</td>
                      <td>{2 + i}m {10 * i}s</td>
                      <td><span className={styles.statusBadge} style={{background: 'rgba(139, 92, 246, 0.1)', color: 'var(--violet)'}}>Summarized</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'WhatsApp':
        return (
          <div className={`${styles.fullView} fade-in`}>
            <div className={styles.viewHeader}>
              <h2>WhatsApp Automation Logs</h2>
            </div>
            <div className={`${styles.activityCard} glass-panel`}>
              <div className={styles.activityList}>
                {ACTIVITY.filter(a => a.msg.includes('WhatsApp') || a.msg.includes('follow-up')).map(item => (
                  <div key={item.id} className={styles.activityItem}>
                    <div className={styles.activityDot} style={{background: '#25D366', boxShadow: '0 0 10px #25D366'}}></div>
                    <div className={styles.activityContent}>
                      <p>{item.msg}</p>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Analytics':
        return (
          <div className={`${styles.fullView} fade-in`}>
            <div className={styles.viewHeader}>
              <h2>System Analytics</h2>
            </div>
            <div className={styles.bentoGrid}>
              <div className={`${styles.chartCard} glass-panel`} style={{gridColumn: 'span 2'}}>
                <div className={styles.cardHeader}><h3>API Response Times (ms)</h3></div>
                <div className={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={CHART_DATA}>
                      <XAxis dataKey="name" hide />
                      <Tooltip />
                      <Line type="monotone" dataKey="calls" stroke="var(--cyan)" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className={`${styles.kpiCard} glass-panel`}>
                <span className={styles.kpiLabel}>Uptime</span>
                <div className={styles.kpiValue}>99.99%</div>
              </div>
              <div className={`${styles.kpiCard} glass-panel`}>
                <span className={styles.kpiLabel}>Avg Latency</span>
                <div className={styles.kpiValue}>312ms</div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles.bentoGrid}>
            <div className={`${styles.chartCard} glass-panel`}>
              <div className={styles.cardHeader}>
                <h3>Lead Growth & Activity</h3>
                <div className={styles.chartLegend}>
                  <span className={styles.legendItem}><span className={styles.dotViolet}></span> Calls</span>
                  <span className={styles.legendItem}><span className={styles.dotPink}></span> Follow-ups</span>
                </div>
              </div>
              <div className={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={CHART_DATA}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--violet)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--violet)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFollowups" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--pink)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="var(--pink)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-dim)" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-surface-solid)', borderColor: 'var(--border-glass)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="calls" stroke="var(--violet)" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={3} />
                    <Area type="monotone" dataKey="followups" stroke="var(--pink)" fillOpacity={1} fill="url(#colorFollowups)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className={`${styles.tableCard} glass-panel`}>
              <div className={styles.cardHeader}>
                <h3>Recent Leads</h3>
                <div className={styles.tableActions}>
                  <button className={styles.filterBtn} onClick={() => setActiveTab('Leads')}><Filter size={14} /> View All</button>
                </div>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Lead</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.slice(0, 4).map(lead => (
                      <tr key={lead.id}>
                        <td>
                          <div className={styles.leadInfo}>
                            <span className={styles.leadName}>{lead.name}</span>
                            <span className={styles.leadPhone}>{lead.phone}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`${styles.statusBadge} ${styles[lead.status]}`}>
                            {lead.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className={`${styles.activityCard} glass-panel`}>
              <div className={styles.cardHeader}>
                <h3>Live Activity</h3>
                <Activity size={18} color="var(--violet)" />
              </div>
              <div className={styles.activityList}>
                {ACTIVITY.map(item => (
                  <div key={item.id} className={styles.activityItem}>
                    <div className={styles.activityDot}></div>
                    <div className={styles.activityContent}>
                      <p>{item.msg}</p>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand} onClick={onBackToLanding}>
          <div className={styles.logoMark}>
            <div className={styles.logoInner}></div>
          </div>
          <span>LeadPulse</span>
        </div>
        
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.navItem} ${activeTab === 'Overview' ? styles.active : ''}`} 
            onClick={() => setActiveTab('Overview')}
          >
            <LayoutDashboard size={20} /> <span>Overview</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'Leads' ? styles.active : ''}`} 
            onClick={() => setActiveTab('Leads')}
          >
            <Users size={20} /> <span>Leads</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'Calls' ? styles.active : ''}`} 
            onClick={() => setActiveTab('Calls')}
          >
            <PhoneCall size={20} /> <span>Calls</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'WhatsApp' ? styles.active : ''}`} 
            onClick={() => setActiveTab('WhatsApp')}
          >
            <MessageCircle size={20} /> <span>WhatsApp</span>
          </button>
          <button 
            className={`${styles.navItem} ${activeTab === 'Analytics' ? styles.active : ''}`} 
            onClick={() => setActiveTab('Analytics')}
          >
            <Activity size={20} /> <span>Analytics</span>
          </button>
        </nav>
        
        <div className={styles.sidebarFooter}>
          <button className={styles.navItem}>
            <Settings size={20} /> <span>Settings</span>
          </button>
          <button className={styles.navItem} onClick={onBackToLanding}>
            <LogOut size={20} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>
      
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1>{activeTab}</h1>
            <p>Managing your LeadPulse environment.</p>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.searchBar}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search everything..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.iconBtn} aria-label="Notifications"><Bell size={20} /></button>
            <div className={styles.userAvatar}>JD</div>
          </div>
        </header>
        
        {activeTab === 'Overview' && (
          <div className={styles.kpiRow}>
            <KpiCard label="Total Leads" value="12,402" trend="+12.5%" trendUp={true} />
            <KpiCard label="Calls Today" value="142" trend="+5.2%" trendUp={true} />
            <KpiCard label="Follow-ups" value="138" trend="+98%" trendUp={true} />
            <KpiCard label="Latency" value="340ms" trend="Stable" trendUp={true} />
          </div>
        )}
        
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
