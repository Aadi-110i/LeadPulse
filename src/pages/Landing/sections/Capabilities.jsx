import {
  Activity,
  Gauge,
  MessageSquare,
  PhoneCall,
  RefreshCw,
  Users,
  Webhook,
} from 'lucide-react';
import styles from '../Landing.module.css';

const CAPABILITIES = [
  {
    id: 'summary',
    icon: MessageSquare,
    title: 'Summaries a person would have written',
    body: 'Not a transcript recap. The intent, the objection and the next step.',
  },
  {
    id: 'events',
    icon: Webhook,
    title: 'Events on the way out',
    body: 'Every meaningful change fires a webhook to the endpoint you register.',
  },
  {
    id: 'pipeline',
    icon: Users,
    title: 'A pipeline you can read at a glance',
    body: 'Four stages, one number each, live straight from the database.',
  },
  {
    id: 'records',
    icon: PhoneCall,
    title: 'Every call, one record',
    body: 'Transcripts, summaries and outcomes stay attached to the lead they belong to.',
  },
  {
    id: 'retries',
    icon: RefreshCw,
    title: 'Retries you never have to think about',
    body: 'BullMQ retries with exponential backoff, so a provider outage never drops a lead.',
  },
  {
    id: 'observability',
    icon: Gauge,
    title: 'Observability you did not build',
    body: 'Queue depth, retry attempts and delivery failures reported from the queue that does the work.',
  },
];

export default function Capabilities() {
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

      <div className={styles.capGrid}>
        {CAPABILITIES.map((capability) => {
          const Icon = capability.icon;
          return (
            <article key={capability.id} className={styles.cap}>
              <span className={styles.capIcon}>
                <Icon size={17} aria-hidden="true" />
              </span>
              <h3 className={styles.capTitle}>{capability.title}</h3>
              <p className={styles.capBody}>{capability.body}</p>
            </article>
          );
        })}
      </div>

      <p className={styles.capAside}>
        <span className={styles.capAsideIcon}>
          <Activity size={14} aria-hidden="true" />
        </span>
        152 calls recorded in the demo dataset
      </p>
    </section>
  );
}
