import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, MessageSquare } from 'lucide-react';
import { Tabs } from '../../../components/ui';
import styles from '../Landing.module.css';

const CALL_ROWS = [
  { outcome: 'Pricing question', when: 'Today 09:14', score: '0.87' },
  { outcome: 'Callback requested', when: 'Tue 16:40', score: '0.74' },
  { outcome: 'Not interested', when: 'Mon 11:02', score: '0.21' },
];

const STAGES = [
  { label: 'new', value: 9, width: '36' },
  { label: 'contacted', value: 25, width: '100' },
  { label: 'converted', value: 18, width: '72' },
  { label: 'lost', value: 12, width: '48' },
];

const THREAD = [
  { from: 'lead', body: 'Can you send the pricing for the Growth plan?' },
  { from: 'pulse', body: 'Of course — Growth is $79/month, and it includes 20,000 logged calls. Want a 15-minute walkthrough this week?' },
];

const VIEWS = [
  {
    id: 'calls',
    label: 'Calls',
    title: 'Read every call the way a person would.',
    body: 'The transcript becomes an intent, a sentiment score and one concrete next step. Not a wall of text you have to skim.',
    points: [
      'Sentiment scored on every logged call',
      'Objections pulled out of the transcript',
      'Summaries attached to the lead record',
    ],
    link: { to: '/docs#log-call', label: 'Log a call' },
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    title: 'Four stages, live from the database.',
    body: 'The board reads the same tables the API writes, so what your sales team sees is never a cached copy of yesterday.',
    points: [
      'Live counts straight from Postgres',
      'Status changes fired by your own webhooks',
      'No manual stage shuffling',
    ],
    link: { to: '/docs#list-leads', label: 'List leads' },
  },
  {
    id: 'followup',
    label: 'Follow-ups',
    title: 'A reply that goes out while it still matters.',
    body: 'The follow-up job is queued with a retry budget, so a provider hiccup never silently drops a warm lead.',
    points: [
      'Queued on Redis with exponential backoff',
      'Delivery receipts recorded per message',
      'Dead letters surfaced, never swallowed',
    ],
    link: { to: '/docs#observability', label: 'Watch the queue' },
  },
];

function CallsPanel() {
  return (
    <div className={styles.mockPanel}>
      <div className={styles.mockHead}>
        <span className="micro">Recent calls</span>
        <span className="micro">score</span>
      </div>
      <ul className={styles.mockList}>
        {CALL_ROWS.map((row) => (
          <li key={`${row.outcome}-${row.when}`} className={styles.mockRow}>
            <span className={styles.mockRowTitle}>{row.outcome}</span>
            <span className={styles.mockRowMeta}>{row.when}</span>
            <span className={styles.mockRowScore}>{row.score}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PipelinePanel() {
  return (
    <div className={styles.mockPanel}>
      <div className={styles.mockHead}>
        <span className="micro">Pipeline</span>
        <span className="micro">leads</span>
      </div>
      <ul className={styles.mockStages}>
        {STAGES.map((stage) => (
          <li key={stage.label} className={styles.mockStage}>
            <span className={styles.mockStageLabel}>{stage.label}</span>
            <span className={styles.mockStageTrack}>
              <span className={`${styles.mockStageFill} ${styles[`mockStageFill--${stage.width}`]}`} />
            </span>
            <span className={styles.mockStageValue}>{stage.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FollowUpPanel() {
  return (
    <div className={styles.mockPanel}>
      <div className={styles.mockHead}>
        <span className="micro">WhatsApp thread</span>
        <span className="micro">2m 41s after hangup</span>
      </div>
      <ul className={styles.mockThread}>
        {THREAD.map((message) => (
          <li
            key={message.body}
            className={
              message.from === 'pulse' ? styles.mockBubbleOut : styles.mockBubbleIn
            }
          >
            <MessageSquare size={12} aria-hidden="true" />
            <span>{message.body}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const PANELS = {
  calls: CallsPanel,
  pipeline: PipelinePanel,
  followup: FollowUpPanel,
};

export default function Showcase() {
  const [activeId, setActiveId] = useState(VIEWS[0].id);
  const active = VIEWS.find((view) => view.id === activeId) ?? VIEWS[0];
  const Panel = PANELS[active.id];

  return (
    <section className={styles.section} id="showcase">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>One assistant</span>
        <h2 className={styles.sectionTitle}>
          One assistant for the whole call lifecycle.
        </h2>
      </div>

      <Tabs
        items={VIEWS.map((view) => ({ id: view.id, label: view.label }))}
        value={activeId}
        onChange={setActiveId}
        ariaLabel="LeadPulse views"
      />

      <div className={styles.showcaseGrid}>
        <div className={styles.showcaseMedia}>
          <div className={styles.mockWindow}>
            <span className={styles.mockWindowBar} aria-hidden="true" />
            <span className={styles.mockWindowBar} aria-hidden="true" />
            <span className={styles.mockWindowBar} aria-hidden="true" />
            <Panel />
          </div>
        </div>

        <div className={styles.showcaseCopy} role="tabpanel" aria-live="polite">
          <h3 className={styles.showcaseTitle}>{active.title}</h3>
          <p className={styles.showcaseBody}>{active.body}</p>
          <ul className={styles.showcasePoints}>
            {active.points.map((point) => (
              <li key={point}>
                <Check size={14} aria-hidden="true" />
                {point}
              </li>
            ))}
          </ul>
          <Link to={active.link.to} className={styles.showcaseLink}>
            {active.link.label}
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
