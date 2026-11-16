import {
  Boxes,
  Cloud,
  Database,
  Globe,
  KeyRound,
  Layers,
  MessageCircle,
  Radio,
  Send,
  Terminal,
  Workflow,
} from 'lucide-react';
import styles from '../Landing.module.css';

const INTEGRATIONS = [
  { id: 'whatsapp', icon: MessageCircle, name: 'WhatsApp', note: 'Delivery' },
  { id: 'redis', icon: Layers, name: 'Redis', note: 'Queue' },
  { id: 'postgres', icon: Database, name: 'Postgres', note: 'Storage' },
  { id: 'bullmq', icon: Boxes, name: 'BullMQ', note: 'Jobs' },
  { id: 'express', icon: Terminal, name: 'Express', note: 'Runtime' },
  { id: 'webhooks', icon: Radio, name: 'Webhooks', note: 'Events' },
  { id: 'jwt', icon: KeyRound, name: 'JWT', note: 'Auth' },
  { id: 'workflow', icon: Workflow, name: 'Workflows', note: 'Routing' },
  { id: 'cloud', icon: Cloud, name: 'Self-hosted', note: 'Deploy' },
  { id: 'cdn', icon: Globe, name: 'Any stack', note: 'REST' },
  { id: 'send', icon: Send, name: 'Send API', note: 'Outbound' },
];

export default function Integrations() {
  return (
    <section className={styles.section} id="integrations">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>Integrations</span>
        <h2 className={styles.sectionTitle}>
          It drops into the stack you already run.
        </h2>
        <p className={styles.sectionBody}>
          LeadPulse is a REST service with a dashboard attached. Anything that can send an HTTP
          request can log a call.
        </p>
      </div>

      <ul className={styles.integrationGrid}>
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          return (
            <li key={integration.id} className={styles.integration}>
              <span className={styles.integrationIcon}>
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className={styles.integrationName}>{integration.name}</span>
              <span className={styles.integrationNote}>{integration.note}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
