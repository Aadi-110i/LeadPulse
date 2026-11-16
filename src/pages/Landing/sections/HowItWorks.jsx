import { CopyButton } from '../../../components/ui';
import styles from '../Landing.module.css';

const CURL = `curl -X POST 'https://api.leadpulse.dev/api/calls' \\
  -H 'Authorization: Bearer LP_KEY_••••' \\
  -H 'Content-Type: application/json' \\
  -d '{"lead_id":"08e9b376-…","duration_seconds":184}'`;

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
    id: 'deliver',
    title: 'Queue and deliver',
    body: 'The job goes onto Redis with a retry budget, the WhatsApp message goes out, and the dashboard records that it did.',
    detail: '98.2% delivery rate',
  },
];

export default function HowItWorks() {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>How it works</span>
        <h2 className={styles.sectionTitle}>
          One request to begin, three steps to a reply.
        </h2>
      </div>

      <div className={styles.stepsLayout}>
        <div className={styles.stepsMedia}>
          <div className={styles.codeBlock}>
            <div className={styles.codeHead}>
              <span className="micro">Log a call</span>
              <CopyButton value={CURL} label="Copy" copiedLabel="Copied" />
            </div>
            <pre className={styles.code}>
              <code>{CURL}</code>
            </pre>
          </div>
        </div>

        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.id} className={styles.step}>
              <div className={styles.stepHead}>
                <span className={styles.stepIndex} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
              </div>
              <p className={styles.stepBody}>{step.body}</p>
              <p className={styles.stepDetail}>{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
