import { useEffect, useState } from 'react';
import { CircleCheck, MessageSquare, PhoneCall, X } from 'lucide-react';
import api from '../../../api/endpoints';
import { Chip, Field, Select, Spinner, useToast } from '../../../components/ui';import LogCallForm from './LogCallForm';
import styles from '../Dashboard.module.css';

const SENTIMENT_TONE = { positive: 'positive', neutral: 'neutral', negative: 'negative' };
const STATUSES = ['new', 'contacted', 'converted', 'lost'];

function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LeadDetail({ leadId, onClose, onChanged }) {
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  // Derived rather than stored, so the effect body never sets state synchronously.
  const loading = detail === null && error === '';

  useEffect(() => {
    if (!leadId) return undefined;

    let cancelled = false;

    api
      .lead(leadId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setStatus(data.lead.status);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [leadId]);

  async function handleStatusChange(next) {
    setSaving(true);
    try {
      const updated = await api.updateLeadStatus(leadId, next);
      setStatus(updated.status);
      setDetail((current) => ({ ...current, lead: updated }));
      toast.push({ tone: 'positive', title: 'Status updated', message: `${updated.name} is now ${updated.status}.` });
      onChanged?.(updated);
    } catch (err) {
      toast.push({ tone: 'negative', title: 'Could not update status', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  if (!leadId) return null;

  return (
    <section className={styles.detail} aria-label="Lead detail">
      <div className={styles.detailHead}>
        <div>
          <h2 className={styles.detailTitle}>{detail?.lead?.name ?? 'Loading…'}</h2>
          <p className={styles.detailMeta}>
            {detail?.lead?.externalId} · {detail?.lead?.company} · {detail?.lead?.email}
          </p>
        </div>
        <button type="button" className={styles.iconButton} onClick={onClose}>
          <X size={16} aria-hidden="true" />
          <span className="visually-hidden">Close detail</span>
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : error ? (
        <p className={styles.panelEmpty}>{error}</p>
      ) : (
        <>
          <div className={styles.detailGrid}>
            <div className={styles.detailBlock}>
              <span className="micro">AI summary</span>
              <p className={styles.detailSummary}>{detail.lead.aiSummary || 'No summary yet.'}</p>
            </div>

            <div className={styles.detailBlock}>
              <span className="micro">Next step</span>
              <p className={styles.detailSummary}>{detail.lead.nextStep || 'None recorded.'}</p>
              <div className={styles.detailChips}>
                <Chip tone={SENTIMENT_TONE[detail.lead.sentiment]} dot>
                  {detail.lead.sentiment} · {detail.lead.sentimentScore}
                </Chip>
                {detail.lead.followupSent ? (
                  <Chip tone="positive">
                    <CircleCheck size={12} aria-hidden="true" />
                    Follow-up sent
                  </Chip>
                ) : (
                  <Chip tone="caution">Follow-up pending</Chip>
                )}
              </div>
            </div>

            <div className={styles.detailBlock}>
              <span className="micro">Move to stage</span>
              <Field label="" htmlFor="lead-status">
                <Select
                  id="lead-status"
                  value={status}
                  disabled={saving}
                  onChange={(event) => handleStatusChange(event.target.value)}
                >
                  {STATUSES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          <div className={styles.detailColumns}>
            <div>
              <h3 className={styles.detailSubhead}>
                <PhoneCall size={13} aria-hidden="true" />
                Call history
              </h3>
              {detail.calls.length === 0 ? (
                <p className={styles.panelEmpty}>No calls recorded for this lead.</p>
              ) : (
                <ul className={styles.callHistory}>
                  {detail.calls.map((call) => (
                    <li key={call.id}>
                      <div className={styles.callHistoryHead}>
                        <span className={styles.callHistoryOutcome}>{call.outcome}</span>
                        <span className={styles.callHistoryTime}>{formatDate(call.createdAt)}</span>
                      </div>
                      <p className={styles.callHistorySummary}>{call.summary}</p>
                      <div className={styles.callHistoryMeta}>
                        <Chip tone={SENTIMENT_TONE[call.sentiment]}>{call.sentiment}</Chip>
                        <span>{Math.round(call.durationSeconds / 60)}m {call.durationSeconds % 60}s</span>
                        {call.nextStep ? <span>· {call.nextStep}</span> : null}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3 className={styles.detailSubhead}>
                <MessageSquare size={13} aria-hidden="true" />
                Log another call
              </h3>
              <LogCallForm
                leads={[detail.lead]}
                defaultLeadId={detail.lead.id}
                compact
                onLogged={() => {
                  api.lead(leadId).then(setDetail).catch(() => {});
                  onChanged?.();
                }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
