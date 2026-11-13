import { useState } from 'react';
import { Send } from 'lucide-react';
import api from '../../../api/endpoints';
import { Button, Field, Note, Select, TextInput, Textarea, useToast } from '../../../components/ui';
import styles from '../Dashboard.module.css';

const OUTCOMES = [
  'Interested',
  'Enterprise inquiry',
  'Callback requested',
  'Pricing question',
  'Support issue',
  'Not interested',
];

export default function LogCallForm({ leads, defaultLeadId, onLogged, compact = false }) {
  const toast = useToast();
  const [leadIdOverride, setLeadIdOverride] = useState('');
  const [duration, setDuration] = useState('180');
  const [outcome, setOutcome] = useState(OUTCOMES[0]);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Derived, so a default lead or a fresh list never needs a synchronising effect.
  const leadId = leadIdOverride || defaultLeadId || leads[0]?.id || '';

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const result = await api.createCall({
        leadId,
        durationSeconds: Number(duration) || 0,
        outcome,
        transcript,
      });

      toast.push({
        tone: 'positive',
        title: 'Call logged',
        message: `Summary written and a follow-up queued (${result.queue}).`,
      });

      setTranscript('');
      onLogged?.(result);
    } catch (err) {
      setError(err.message ?? 'Could not log the call.');
      toast.push({ tone: 'negative', title: 'Call failed', message: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={`${styles.callForm} ${compact ? styles['callForm--compact'] : ''}`} onSubmit={handleSubmit}>
      <div className={styles.callFormGrid}>
        <Field label="Lead" htmlFor="call-lead">
          <Select
            id="call-lead"
            value={leadId}
            onChange={(event) => setLeadIdOverride(event.target.value)}
            required
          >
            {leads.map((lead) => (
              <option key={lead.id} value={lead.id}>
                {lead.name} — {lead.company}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Duration" htmlFor="call-duration" hint="Seconds.">
          <TextInput
            id="call-duration"
            type="number"
            min="0"
            max="86400"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
          />
        </Field>

        <Field label="Outcome" htmlFor="call-outcome">
          <Select id="call-outcome" value={outcome} onChange={(event) => setOutcome(event.target.value)}>
            {OUTCOMES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Transcript"
        htmlFor="call-transcript"
        hint="The analyser extracts the intent, the objection and the next step."
      >
        <Textarea
          id="call-transcript"
          rows={compact ? 3 : 5}
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          placeholder="Hi, we spoke about bulk pricing for our sales team…"
        />
      </Field>

      {error ? <Note tone="negative">{error}</Note> : null}

      <Button type="submit" variant="primary" disabled={busy || !leadId}>
        <Send size={15} aria-hidden="true" />
        {busy ? 'Analysing…' : 'Log call and queue follow-up'}
      </Button>
    </form>
  );
}
