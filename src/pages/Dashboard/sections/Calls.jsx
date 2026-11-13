import { useEffect, useState } from 'react';
import { PhoneCall } from 'lucide-react';
import api from '../../../api/endpoints';
import { Chip, EmptyState, Spinner } from '../../../components/ui';
import LogCallForm from '../components/LogCallForm';
import styles from '../Dashboard.module.css';

const SENTIMENT_TONE = { positive: 'positive', neutral: 'neutral', negative: 'negative' };

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Calls({ leads, onLogged }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await api.calls({ limit: 40 });
      setCalls(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleLogged() {
    await load();
    onLogged?.();
  }
  return (
    <div className={styles.callsLayout}>
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Call history</h2>
          <span className={styles.cardMeta}>{calls.length} most recent</span>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <Spinner />
          </div>
        ) : calls.length === 0 ? (
          <EmptyState
            icon={PhoneCall}
            title="No calls recorded yet"
            body="Log the first call on the right and LeadPulse will summarise it and queue the follow-up."
          />
        ) : (
          <ul className={styles.callList}>
            {calls.map((call) => (
              <li key={call.id} className={styles.callRow}>
                <div className={styles.callRowMain}>
                  <span className={styles.callRowLead}>{call.leadName}</span>
                  <span className={styles.callRowId}>{call.leadExternalId}</span>
                </div>
                <div className={styles.callRowOutcome}>
                  <Chip tone={SENTIMENT_TONE[call.sentiment]}>{call.outcome}</Chip>
                </div>
                <p className={styles.callRowSummary}>{call.summary}</p>
                <span className={styles.callRowTime}>{formatDate(call.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>Log a call</h2>
          <span className={styles.cardMeta}>POST /api/calls</span>
        </div>
        <LogCallForm leads={leads} onLogged={handleLogged} />
      </aside>
    </div>
  );
}
