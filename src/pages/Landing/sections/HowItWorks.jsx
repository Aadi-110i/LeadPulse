import { Check } from 'lucide-react';
import styles from '../Landing.module.css';

const STEPS = [
  {
    id: 'log',
    title: 'Log the call',
    body: 'One POST carries the lead, the duration and the transcript. That is the whole integration.',
    detail: 'POST /api/calls',
  },
  {
    id: 'summarise',
    title: 'Read the intent',
    body: 'The transcript becomes a summary, a sentiment score and one concrete next step your team can act on.',
    detail: 'sentiment: positive',
  },
  {
    id: 'queue',
    title: 'Queue the follow-up',
    body: 'The job goes onto Redis with a retry budget, so a provider outage never silently drops a lead.',
    detail: 'BullMQ · 3 attempts',
  },
  {
    id: 'deliver',
    title: 'Deliver on WhatsApp',
    body: 'The message lands while the conversation is still warm, and the dashboard records that it did.',
    detail: '98.2% delivery rate',
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>How it works</span>
        <h2 className={styles.sectionTitle}>
          From hangup to follow-up, without anyone remembering to.
        </h2>
      </div>

      <ol className={styles.steps}>
        {STEPS.map((step, index) => (
          <li key={step.id} className={styles.step}>
            <div className={styles.stepHead}>
              <span className={styles.stepIndex} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <Check size={14} className={styles.stepCheck} aria-hidden="true" />
            </div>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepBody}>{step.body}</p>
            <p className={styles.stepDetail}>{step.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
