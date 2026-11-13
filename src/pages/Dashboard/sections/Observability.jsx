import { Activity, Clock, Radio, Webhook } from 'lucide-react';
import { Chip, EmptyState } from '../../../components/ui';
import styles from '../Dashboard.module.css';

const JOB_TONE = {
  sent: 'positive',
  queued: 'accent',
  processing: 'accent',
  failed: 'negative',
  dead_letter: 'negative',
};

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Observability({ observability, stats }) {
  if (!observability) return null;

  const buckets = observability.latencyBuckets ?? [];
  const maxBucket = Math.max(...buckets.map((b) => b.count), 1);
  const jobs = observability.recentJobs ?? [];
  const webhooks = observability.recentWebhooks ?? [];

  return (
    <div className={styles.observability}>
      <div className={styles.kpiRow}>
        <div className={styles.kpi}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiIcon}>
              <Activity size={14} aria-hidden="true" />
            </span>
            <span className="micro">Jobs delivered</span>
          </div>
          <p className={styles.kpiValue}>{observability.jobs.sent}</p>
          <p className={styles.kpiNote}>of {observability.jobs.total} queued</p>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiIcon}>
              <Radio size={14} aria-hidden="true" />
            </span>
            <span className="micro">Waiting</span>
          </div>
          <p className={styles.kpiValue}>{observability.jobs.queued}</p>
          <p className={styles.kpiNote}>awaiting delivery</p>
        </div>

        <div
          className={`${styles.kpi} ${
            observability.jobs.failed + observability.jobs.deadLetter > 0 ? styles['kpi--warning'] : ''
          }`}
        >
          <div className={styles.kpiHead}>
            <span className={styles.kpiIcon}>
              <Activity size={14} aria-hidden="true" />
            </span>
            <span className="micro">Failed</span>
          </div>
          <p className={styles.kpiValue}>{observability.jobs.failed + observability.jobs.deadLetter}</p>
          <p className={styles.kpiNote}>{observability.jobs.deadLetter} dead-lettered</p>
        </div>

        <div className={styles.kpi}>
          <div className={styles.kpiHead}>
            <span className={styles.kpiIcon}>
              <Clock size={14} aria-hidden="true" />
            </span>
            <span className="micro">Avg latency</span>
          </div>
          <p className={styles.kpiValue}>
            {stats?.avgLatencyMs ?? 0}
            <span className={styles.kpiUnit}>ms</span>
          </p>
          <p className={styles.kpiNote}>queue to delivery</p>
        </div>
      </div>

      <div className={styles.observabilityGrid}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Latency distribution</h2>
            <span className={styles.cardMeta}>completed jobs</span>
          </div>
          {buckets.length === 0 ? (
            <p className={styles.panelEmpty}>No completed jobs yet.</p>
          ) : (
            <ul className={styles.bucketList}>
              {buckets.map((bucket) => (
                <li key={bucket.bucket}>
                  <span className={styles.bucketLabel}>{bucket.bucket}</span>
                  <progress
                    className={styles.bucketBar}
                    value={bucket.count}
                    max={maxBucket}
                    aria-label={`${bucket.bucket}: ${bucket.count} jobs`}
                  />
                  <span className={styles.bucketCount}>{bucket.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Webhook deliveries</h2>
            <span className={styles.cardMeta}>
              {observability.webhooks.delivered} delivered · {observability.webhooks.failed} failed
            </span>
          </div>
          {webhooks.length === 0 ? (
            <EmptyState icon={Webhook} title="No webhook deliveries" body="Registered endpoints will show up here." />
          ) : (
            <ul className={styles.hookList}>
              {webhooks.map((hook) => (
                <li key={hook.id}>
                  <span className={styles.hookType}>{hook.eventType}</span>
                  <span className={styles.hookUrl}>{hook.targetUrl}</span>
                  <Chip tone={hook.status === 'delivered' ? 'positive' : 'negative'}>{hook.statusCode}</Chip>
                  <span className={styles.hookTime}>{formatDate(hook.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Recent jobs</h2>
          <span className={styles.cardMeta}>{jobs.length} most recent</span>
        </div>
        {jobs.length === 0 ? (
          <EmptyState icon={Activity} title="No jobs yet" body="Log a call to put one on the queue." />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Lead</th>
                  <th scope="col">Channel</th>
                  <th scope="col">Status</th>
                  <th scope="col">Attempts</th>
                  <th scope="col">Created</th>
                  <th scope="col">Error</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      <span className={styles.cellName}>{job.leadName}</span>
                      <span className={styles.cellId}>{job.leadExternalId}</span>
                    </td>
                    <td className={styles.cellMono}>{job.channel}</td>
                    <td>
                      <Chip tone={JOB_TONE[job.status]}>{job.status.replace('_', ' ')}</Chip>
                    </td>
                    <td className={styles.cellMono}>{job.attempts}</td>
                    <td className={styles.cellTime}>{formatDate(job.createdAt)}</td>
                    <td className={styles.cellError}>{job.error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
