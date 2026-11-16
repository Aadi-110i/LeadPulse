import { ArrowRight, Clock, PhoneCall, Shield } from 'lucide-react';
import { Button, Chip, CopyButton } from '../../../components/ui';
import heroImage from '../../../assets/hero-ridge.jpg';
import styles from '../Landing.module.css';

const SAMPLE_SUMMARY =
  'Customer is evaluating the Pro plan. Main concern is pricing. Suggested a follow-up demo on Friday.';

const HERO_STATS = [
  { value: '7', label: 'REST endpoints' },
  { value: '2m 41s', label: 'median follow-up' },
  { value: '98.2%', label: 'delivery rate' },
];

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroBackdrop} aria-hidden="true">
        <img src={heroImage} alt="" className={styles.heroImage} />
        <div className={styles.heroScrim} />
      </div>

      <div className={styles.heroInner}>
        <div className={styles.heroContent}>
          <span className={styles.heroEyebrow} data-anim="fade">
            <span className={styles.heroEyebrowDot} aria-hidden="true" />
            API-first lead intelligence
          </span>

          <h1 className={styles.heroTitle} data-anim="rise" data-anim-delay="1">
            The complete stack for calls that never go cold.
          </h1>

          <p className={styles.heroLede} data-anim="rise" data-anim-delay="2">
            Log the call. LeadPulse transcribes it, reads the intent and sends the WhatsApp
            follow-up while the lead is still warm &mdash; one API, one queue, one dashboard.
          </p>

          <div className={styles.heroActions} data-anim="rise" data-anim-delay="3">
            <Button to="/signup" variant="primary" size="lg">
              Start free
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
            <Button to="/docs" variant="secondary" size="lg">
              Read the API docs
            </Button>
          </div>

          <p className={styles.heroNote} data-anim="rise" data-anim-delay="4">
            <Shield size={13} aria-hidden="true" />
            One REST API. Bearer auth. No SDK to learn before you can log your first call.
          </p>
        </div>

        <aside className={styles.heroPanel} data-anim="panel">
          <div className={styles.heroPanelHead}>
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

          <p className={styles.heroPanelCaption}>
            <PhoneCall size={13} aria-hidden="true" />
            Sample record. Every field below is returned by the live API.
          </p>
        </aside>
      </div>

      <dl className={styles.heroStats}>
        {HERO_STATS.map((stat) => (
          <div key={stat.label} className={styles.heroStat}>
            <dt className={styles.heroStatLabel}>{stat.label}</dt>
            <dd className={styles.heroStatValue}>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
