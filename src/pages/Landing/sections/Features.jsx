import {
  Activity,
  Gauge,
  MessageSquare,
  PhoneCall,
  Users,
  Webhook,
} from 'lucide-react';
import { Chip, CopyButton } from '../../../components/ui';
import styles from '../Landing.module.css';

const CURL = `curl -X POST 'https://api.leadpulse.dev/api/calls' \\
  -H 'Authorization: Bearer LP_KEY_••••' \\
  -H 'Content-Type: application/json' \\
  -d '{"lead_id":"08e9b376-…","duration_seconds":184}'`;

const PIPELINE = [
  { label: 'new', value: 9 },
  { label: 'contacted', value: 25 },
  { label: 'converted', value: 18 },
  { label: 'lost', value: 12 },
];

const PIPELINE_MAX = Math.max(...PIPELINE.map((row) => row.value));

const EVENTS = [
  { type: 'call.logged', time: '09:41:02' },
  { type: 'call.summarized', time: '09:41:03' },
  { type: 'followup.sent', time: '09:41:05' },
  { type: 'lead.status_changed', time: '09:52:18' },
];

const CALLS = [
  { outcome: 'Pricing question', when: 'Today 09:14', tone: 'positive' },
  { outcome: 'Callback requested', when: 'Tue 16:40', tone: 'positive' },
  { outcome: 'Not interested', when: 'Mon 11:02', tone: 'negative' },
];

const LATENCY = [
  { bucket: '<500ms', count: 96 },
  { bucket: '500ms–2s', count: 18 },
  { bucket: '2s–5s', count: 4 },
  { bucket: '>5s', count: 0 },
];

const LATENCY_MAX = Math.max(...LATENCY.map((row) => row.count), 1);

export default function Features() {
  return (
    <section className={styles.section} id="features">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>Features</span>
        <h2 className={styles.sectionTitle}>
          The backend you would have written, already running.
        </h2>
        <p className={styles.sectionBody}>
          LeadPulse is not a no-code CRM. It is a small, opinionated service with a dashboard
          attached, so it drops into the stack you already have.
        </p>
      </div>

      <div className={styles.bento}>
        <article className={`${styles.bentoCard} ${styles['bentoCard--wide']}`}>
          <div className={styles.bentoCopy}>
            <h3 className={styles.bentoTitle}>Log a call in one POST</h3>
            <p className={styles.bentoBody}>
              The endpoint takes a lead, a duration and a transcript. Summarisation, sentiment
              and the follow-up job are all downstream of that single request.
            </p>
          </div>
          <div className={styles.codeBlock}>
            <div className={styles.codeHead}>
              <span className="micro">cURL</span>
              <CopyButton value={CURL} label="Copy" copiedLabel="Copied" />
            </div>
            <pre className={styles.code}>
              <code>{CURL}</code>
            </pre>
          </div>
        </article>

        <article className={styles.bentoCard}>
          <span className={styles.bentoIcon}>
            <MessageSquare size={18} aria-hidden="true" />
          </span>
          <h3 className={styles.bentoTitle}>Summaries a person would have written</h3>
          <p className={styles.bentoBody}>
            Not a transcript recap. The intent, the objection and the next step.
          </p>
          <div className={styles.sampleSummary}>
            <p>&ldquo;Interested in premium plan. Needs follow-up on Tuesday.&rdquo;</p>
            <div className={styles.sampleFooter}>
              <Chip tone="positive" dot>
                Positive
              </Chip>
              <span className="micro">0.87</span>
            </div>
          </div>
        </article>

        <article className={styles.bentoCard}>
          <span className={styles.bentoIcon}>
            <Webhook size={18} aria-hidden="true" />
          </span>
          <h3 className={styles.bentoTitle}>Events on the way out</h3>
          <p className={styles.bentoBody}>
            Every meaningful change fires a webhook to the endpoint you register.
          </p>
          <ul className={styles.eventList}>
            {EVENTS.map((event) => (
              <li key={event.type}>
                <span className={styles.eventType}>{event.type}</span>
                <span className={styles.eventTime}>{event.time}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.bentoCard}>
          <span className={styles.bentoIcon}>
            <Users size={18} aria-hidden="true" />
          </span>
          <h3 className={styles.bentoTitle}>A pipeline you can read at a glance</h3>
          <p className={styles.bentoBody}>Four stages, one number each, live from the database.</p>
          <ul className={styles.pipelineList}>
            {PIPELINE.map((row) => (
              <li key={row.label}>
                <span className={styles.pipelineLabel}>{row.label}</span>
                <progress
                  className={styles.pipelineBar}
                  value={row.value}
                  max={PIPELINE_MAX}
                  aria-label={`${row.label}: ${row.value} leads`}
                />
                <span className={styles.pipelineValue}>{row.value}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className={styles.bentoCard}>
          <span className={styles.bentoIcon}>
            <PhoneCall size={18} aria-hidden="true" />
          </span>
          <h3 className={styles.bentoTitle}>Every call, one record</h3>
          <p className={styles.bentoBody}>
            Transcripts, summaries and outcomes stay attached to the lead they belong to.
          </p>
          <ul className={styles.callList}>
            {CALLS.map((call) => (
              <li key={`${call.outcome}-${call.when}`}>
                <span className={styles.callOutcome}>{call.outcome}</span>
                <Chip tone={call.tone}>{call.when}</Chip>
              </li>
            ))}
          </ul>
          <p className={styles.bentoAside}>
            <span className={styles.bentoAsideIcon}>
              <Activity size={14} aria-hidden="true" />
            </span>
            152 calls recorded in the demo dataset
          </p>
        </article>

        <article className={`${styles.bentoCard} ${styles['bentoCard--wide']}`}>
          <div className={styles.bentoCopy}>
            <h3 className={styles.bentoTitle}>Observability you did not have to build</h3>
            <p className={styles.bentoBody}>
              Queue depth, retry attempts, delivery failures and latency &mdash; reported from the
              same queue that does the work, not from a hopeful dashboard.
            </p>
            <p className={styles.bentoAside}>
              <span className={styles.bentoAsideIcon}>
                <Gauge size={14} aria-hidden="true" />
              </span>
              Failed jobs and dead letters are visible, not swallowed
            </p>
          </div>
          <ul className={styles.latencyList}>
            {LATENCY.map((row) => (
              <li key={row.bucket}>
                <span className={styles.latencyBucket}>{row.bucket}</span>
                <progress
                  className={styles.latencyBar}
                  value={row.count}
                  max={LATENCY_MAX}
                  aria-label={`${row.bucket}: ${row.count} jobs`}
                />
                <span className={styles.latencyCount}>{row.count}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}
