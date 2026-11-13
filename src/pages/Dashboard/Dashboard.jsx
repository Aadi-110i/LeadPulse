import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  Gauge,
  Inbox,
  LogOut,
  PhoneCall,
  Radio,
  RefreshCw,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { Button, Chip, Spinner } from '../../components/ui';
import useDashboardData from './hooks/useDashboardData';
import Overview from './sections/Overview';
import Pipeline from './sections/Pipeline';
import Calls from './sections/Calls';
import Observability from './sections/Observability';
import styles from './Dashboard.module.css';

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Gauge, path: '/app' },
  { id: 'pipeline', label: 'Pipeline', icon: Users, path: '/app/pipeline' },
  { id: 'calls', label: 'Calls', icon: PhoneCall, path: '/app/calls' },
  { id: 'observability', label: 'Observability', icon: BarChart3, path: '/app/observability' },
];

const ENDPOINTS = [
  { method: 'GET', path: '/api/leads' },
  { method: 'POST', path: '/api/calls' },
  { method: 'PATCH', path: '/api/leads/{id}' },
  { method: 'GET', path: '/api/stats' },
  { method: 'GET', path: '/api/stats/observability' },
];

function timeAgo(date) {  if (!date) return '';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Dashboard() {
  const { section = 'overview' } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { stats, activity, observability, leads, loading, error, lastSync, refresh } =
    useDashboardData();

  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }

  function handleSignOut() {
    signOut();
    navigate('/', { replace: true });
  }

  useEffect(() => {
    if (!stats) return;
    document.title = `LeadPulse — ${SECTIONS.find((s) => s.id === section)?.label ?? 'Dashboard'}`;
  }, [stats, section]);

  const deliveryRate = stats ? Math.round(stats.deliveryRate * 1000) / 10 : 0;

  return (
    <div className={styles.app} data-surface="app">
      <header className={styles.header}>
        <Link to="/" className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">
            <span />
          </span>
          <span className={styles.brandName}>
            Lead<em>Pulse</em>
          </span>
        </Link>

        <nav className={styles.headerNav} aria-label="Dashboard sections">
          {SECTIONS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/app'}
              className={({ isActive }) =>
                `${styles.headerLink} ${isActive ? styles['headerLink--active'] : ''}`
              }
            >
              <item.icon size={15} aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <span className={styles.session}>
            <span className={styles.sessionDot} aria-hidden="true" />
            Session active
          </span>
          <span className={styles.headerUser}>{user?.email}</span>
          <button type="button" className={styles.iconButton} onClick={handleSignOut}>
            <LogOut size={15} aria-hidden="true" />
            <span className="visually-hidden">Sign out</span>
          </button>
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.leftRail}>
          <div className={styles.railBlock}>
            <p className="micro">Endpoints</p>
            <ul className={styles.endpointList}>
              {ENDPOINTS.map((endpoint) => (
                <li key={`${endpoint.method}-${endpoint.path}`}>
                  <span className={styles.endpointMethod}>{endpoint.method}</span>
                  <span className={styles.endpointPath}>{endpoint.path}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.railBlock}>
            <p className="micro">Queue</p>
            <div className={styles.railStat}>
              <span className={styles.railStatValue}>{stats?.queuedJobs ?? 0}</span>
              <span className={styles.railStatLabel}>waiting</span>
            </div>
            <div className={styles.railStat}>
              <span className={styles.railStatValue}>{stats?.failedJobs ?? 0}</span>
              <span className={styles.railStatLabel}>failed</span>
            </div>
            <div className={styles.railStat}>
              <span className={styles.railStatValue}>{deliveryRate}%</span>
              <span className={styles.railStatLabel}>delivered</span>
            </div>
          </div>

          <div className={styles.railCta}>
            <p className={styles.railCtaTitle}>Log a call</p>
            <p className={styles.railCtaBody}>
              Summarise it, score it and queue the follow-up in one request.
            </p>
            <Button to="/app/calls" variant="primary" size="sm" full>
              <PhoneCall size={14} aria-hidden="true" />
              Log a call
            </Button>
          </div>

          <p className={styles.railSync}>
            {lastSync ? `Synced ${timeAgo(lastSync)}` : 'Syncing…'}
          </p>
        </aside>

        <main className={styles.main}>
          <div className={styles.mainToolbar}>
            <div>
              <h1 className={styles.mainTitle}>
                {SECTIONS.find((s) => s.id === section)?.label ?? 'Overview'}
              </h1>
              <p className={styles.mainSubtitle}>
                {section === 'overview'
                  ? 'Live pipeline state, straight from the database.'
                  : section === 'pipeline'
                    ? 'Every lead, searchable and sortable.'
                    : section === 'calls'
                      ? 'Call history and a place to log the next one.'
                      : 'Queue depth, latency and delivery health.'}
              </p>
            </div>
            <div className={styles.mainActions}>
              <Button variant="secondary" size="sm" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw size={14} className={refreshing ? styles.spinning : undefined} aria-hidden="true" />
                Refresh
              </Button>
            </div>
          </div>

          {error ? (
            <div className={styles.errorBanner}>
              <Chip tone="negative">API unreachable</Chip>
              <span>{error}</span>
            </div>
          ) : null}

          {loading && !stats ? (
            <div className={styles.loading}>
              <Spinner large />
            </div>
          ) : (
            <>
              {section === 'overview' ? (
                <Overview
                  stats={stats}
                  leads={leads}
                  onSelectLead={(lead) => navigate('/app/pipeline', { state: { leadId: lead.id } })}
                />
              ) : null}
              {section === 'pipeline' ? (
                <Pipeline
                  leads={leads}
                  stats={stats}
                  onRefresh={refresh}
                />
              ) : null}
              {section === 'calls' ? <Calls leads={leads} onLogged={() => refresh({ silent: true })} /> : null}
              {section === 'observability' ? (
                <Observability observability={observability} stats={stats} />
              ) : null}
            </>
          )}
        </main>

        <aside className={styles.rightColumn}>
          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>
                <Radio size={14} aria-hidden="true" />
                Live pulse
              </h2>
              <span className={styles.panelMeta}>{activity.length} events</span>
            </div>
            {activity.length === 0 ? (
              <p className={styles.panelEmpty}>Nothing yet.</p>
            ) : (
              <ul className={styles.pulseList}>
                {activity.map((event, index) => (
                  <li key={`${event.kind}-${event.at}-${index}`} className={styles.pulseItem}>
                    <span
                      className={`${styles.pulseDot} ${styles[`pulseDot--${event.jobStatus ?? event.kind}`]}`}
                      aria-hidden="true"
                    />
                    <div className={styles.pulseBody}>
                      <p className={styles.pulseTitle}>
                        {event.kind === 'call' ? 'Call logged' : 'Follow-up job'}
                      </p>
                      <p className={styles.pulseDetail}>{event.leadName}</p>
                      {event.detail ? <p className={styles.pulseNote}>{event.detail}</p> : null}
                    </div>
                    <span className={styles.pulseTime}>{timeAgo(event.at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>
                <Activity size={14} aria-hidden="true" />
                Delivery
              </h2>
              <span className={styles.panelMeta}>last 30 days</span>
            </div>
            <div className={styles.delivery}>
              <span className={styles.deliveryValue}>{deliveryRate}%</span>
              <span className={styles.deliveryLabel}>follow-ups delivered</span>
            </div>
            <dl className={styles.miniStats}>
              <div>
                <dt>Sent</dt>
                <dd>{observability?.jobs?.sent ?? 0}</dd>
              </div>
              <div>
                <dt>Failed</dt>
                <dd>{observability?.jobs?.failed ?? 0}</dd>
              </div>
              <div>
                <dt>Queued</dt>
                <dd>{observability?.jobs?.queued ?? 0}</dd>
              </div>
              <div>
                <dt>Dead letter</dt>
                <dd>{observability?.jobs?.deadLetter ?? 0}</dd>
              </div>
            </dl>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHead}>
              <h2 className={styles.panelTitle}>
                <Inbox size={14} aria-hidden="true" />
                Webhooks
              </h2>
              <span className={styles.panelMeta}>{observability?.webhooks?.total ?? 0} events</span>
            </div>
            <ul className={styles.webhookList}>
              {(observability?.recentWebhooks ?? []).slice(0, 6).map((hook) => (
                <li key={hook.id}>
                  <span className={styles.webhookType}>{hook.eventType}</span>
                  <Chip tone={hook.status === 'delivered' ? 'positive' : 'negative'}>
                    {hook.statusCode}
                  </Chip>
                </li>
              ))}
              {(observability?.recentWebhooks ?? []).length === 0 ? (
                <li className={styles.panelEmpty}>No webhook deliveries yet.</li>
              ) : null}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
