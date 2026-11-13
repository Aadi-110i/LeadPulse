import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, Clock, PhoneCall, TriangleAlert, Users } from 'lucide-react';
import { Chip } from '../../../components/ui';
import styles from '../Dashboard.module.css';

const SENTIMENT_TONE = { positive: 'positive', neutral: 'neutral', negative: 'negative' };
const STATUS_TONE = { new: 'neutral', contacted: 'accent', converted: 'positive', lost: 'negative' };
const SERIES_LABEL = { calls: 'Calls', positive: 'Positive calls' };

function formatDay(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Custom tooltip body. Recharts' default tooltip ships hard-coded inline
 * styles, so the surface is drawn here with module classes and tokens.
 */
function TrendTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{formatDay(label)}</p>
      <ul className={styles.tooltipList}>
        {payload.map((entry) => (
          <li key={entry.dataKey} className={styles.tooltipRow}>
            <span className={styles.tooltipName}>{SERIES_LABEL[entry.dataKey] ?? entry.name}</span>
            <span className={styles.tooltipValue}>{entry.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function KpiTile({ icon: Icon, label, value, unit, note, tone = 'default' }) {
  return (
    <div className={`${styles.kpi} ${tone !== 'default' ? styles[`kpi--${tone}`] : ''}`}>
      <div className={styles.kpiHead}>
        <span className={styles.kpiIcon}>
          <Icon size={14} aria-hidden="true" />
        </span>
        <span className="micro">{label}</span>
      </div>
      <p className={styles.kpiValue}>
        {value}
        {unit ? <span className={styles.kpiUnit}>{unit}</span> : null}
      </p>
      <p className={styles.kpiNote}>{note}</p>
    </div>
  );
}

export default function Overview({ stats, leads, onSelectLead }) {
  if (!stats) return null;

  const trend = stats.trend ?? [];
  const recentLeads = (leads ?? []).slice(0, 7);
  const pipelineTotal = Object.values(stats.pipeline ?? {}).reduce((sum, value) => sum + value, 0);

  // One label per ~two days keeps the axis readable instead of stacking
  // fourteen dates on top of each other.
  const tickInterval = Math.max(1, Math.ceil(trend.length / 7));
  const completedJobs = (stats.jobs?.sent ?? 0) + (stats.failedJobs ?? 0);
  const failureRate = completedJobs === 0 ? 0 : (stats.failedJobs ?? 0) / completedJobs;

  return (
    <div className={styles.overview}>
      <div className={styles.kpiRow}>
        <KpiTile
          icon={Users}
          label="Leads tracked"
          value={stats.totalLeads}
          note={`${stats.pipeline.converted} converted · ${stats.pipeline.lost} lost`}
        />
        <KpiTile
          icon={PhoneCall}
          label="Calls today"
          value={stats.callsToday}
          note={`${stats.sentiment.positive} positive calls on record`}
        />
        <KpiTile
          icon={Clock}
          label="Queue latency"
          value={stats.avgLatencyMs}
          unit="ms"
          note={`${Math.round(stats.deliveryRate * 1000) / 10}% delivered`}
        />
        <KpiTile
          icon={TriangleAlert}
          label="Failed jobs"
          value={stats.failedJobs}
          note={`${Math.round(failureRate * 1000) / 10}% of completed · ${stats.queuedJobs} waiting`}
          tone={failureRate > 0.05 ? 'warning' : 'default'}
        />
      </div>

      <div className={styles.overviewGrid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Calls per day</h2>
            <span className={styles.cardMeta}>last 14 days</span>
          </div>
          <div className={styles.chartWrap}>
            {trend.length === 0 ? (
              <p className={styles.panelEmpty}>No calls recorded in this window.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop className={styles.chartFillTop} offset="0%" />
                      <stop className={styles.chartFillBottom} offset="100%" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="day"
                    tickFormatter={(value) => String(value).slice(5)}
                    interval={tickInterval}
                    minTickGap={6}
                    tickLine={false}
                  />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip content={<TrendTooltip />} />
                  <Area
                    className={styles.chartArea}
                    type="monotone"
                    dataKey="calls"
                    strokeWidth={2}
                    fill="url(#callsFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Pipeline</h2>
            <span className={styles.cardMeta}>{pipelineTotal} total</span>
          </div>
          <ul className={styles.pipelineBreakdown}>
            {Object.entries(stats.pipeline ?? {}).map(([status, count]) => (
              <li key={status}>
                <span className={styles.pipelineStatus}>
                  <Chip tone={STATUS_TONE[status]}>{status}</Chip>
                </span>
                <span className={styles.pipelineBar}>
                  <progress
                    className={styles.pipelineProgress}
                    value={count}
                    max={pipelineTotal || 1}
                    aria-label={`${status}: ${count} leads`}
                  />
                </span>
                <span className={styles.pipelineCount}>{count}</span>
              </li>
            ))}
          </ul>

          <div className={styles.sentimentRow}>
            {Object.entries(stats.sentiment ?? {}).map(([key, count]) => (
              <div key={key} className={styles.sentimentCell}>
                <Chip tone={SENTIMENT_TONE[key]}>{key}</Chip>
                <span className={styles.sentimentCount}>{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Recently updated</h2>
          <Link to="/app/pipeline" className={styles.cardLink}>
            Open pipeline
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <ul className={styles.recentList}>
          {recentLeads.map((lead) => (
            <li key={lead.id}>
              <button type="button" className={styles.recentRow} onClick={() => onSelectLead?.(lead)}>
                <span className={styles.recentName}>{lead.name}</span>
                <span className={styles.recentCompany}>{lead.company}</span>
                <Chip tone={STATUS_TONE[lead.status]}>{lead.status}</Chip>
                <Chip tone={SENTIMENT_TONE[lead.sentiment]}>{lead.sentiment}</Chip>
                <span className={styles.recentNext}>{lead.nextStep}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
