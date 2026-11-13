import { ArrowRight, Clock, PhoneCall } from 'lucide-react';
import { Button, Chip, CopyButton } from '../../../components/ui';
import styles from '../Landing.module.css';

const SAMPLE_SUMMARY =
  'Customer is evaluating the Pro plan. Main concern is pricing. Suggested a follow-up demo on Friday.';

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroHead}>
        <h1 className={styles.heroTitle}>
          Never lose a
          <br />
          follow-up again.
        </h1>
        <p className={styles.heroLede}>
          Log every call. LeadPulse transcribes it, reads the intent, and sends the WhatsApp
          follow-up within minutes of hangup &mdash; while the lead is still warm.
        </p>
        <div className={styles.heroActions}>
          <Button to="/signup" variant="primary" size="lg">
            Start free
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
          <Button to="/docs" variant="secondary" size="lg">
            Read the API docs
          </Button>
        </div>
        <p className={styles.heroNote}>
          One REST API. Bearer auth. No SDK to learn before you can log your first call.
        </p>
      </div>

      <figure className={styles.heroCard}>
        <div className={styles.heroCardHead}>
          <span className="micro">Call record</span>
          <Chip tone="accent">Analysed</Chip>
        </div>

        <dl className={styles.record}>
          <div className={styles.recordRow}>
            <dt className="micro">Lead</dt>
            <dd>lead_204 &middot; Rahul Sharma</dd>
          </div>
          <div className={styles.recordRow}>
            <dt className="micro">Duration</dt>
            <dd>3m 02s</dd>
          </div>
          <div className={styles.recordRow}>
            <dt className="micro">Outcome</dt>
            <dd>Interested</dd>
          </div>
        </dl>

        <div className={styles.summary}>
          <span className="micro">AI summary</span>
          <p>{SAMPLE_SUMMARY}</p>
          <CopyButton value={SAMPLE_SUMMARY} label="Copy summary" copiedLabel="Copied" />
        </div>

        <div className={styles.followup}>
          <Chip tone="positive" dot>
            Follow-up sent
          </Chip>
          <span className={styles.followupMeta}>
            <Clock size={13} aria-hidden="true" />
            2m 41s after hangup
          </span>
        </div>

        <figcaption className={styles.heroCardCaption}>
          <PhoneCall size={13} aria-hidden="true" />
          Sample record. Every field below is returned by the live API.
        </figcaption>
      </figure>
    </section>
  );
}
