import crypto from 'node:crypto';

/**
 * Local call summarisation.
 *
 * The production path calls an LLM (GPT-4o) with the transcript. No API key is
 * wired in this build, so this module provides a deterministic local analyser
 * with the same contract: transcript in, summary + sentiment + next step out.
 * Swapping in a provider only means replacing `summariseCall`.
 */

const POSITIVE = ['interested', 'interested in', 'demo', 'pricing', 'works', 'great', 'happy', 'ready', 'start', 'yes', 'proceed', 'send me', 'follow up', 'call back', 'callback'];
const NEGATIVE = ['not interested', 'unhappy', 'missed', 'failed', 'problem', 'issue', 'escalat', 'expensive', 'competitor', 'incumbent', 'never', 'stop'];

const OUTCOME_RULES = [
  { match: /bulk pricing|pricing sheet|different between plans/i, outcome: 'Pricing question', sentiment: 'neutral', score: 0.5, nextStep: 'Send pricing sheet' },
  { match: /enterprise|40-seat|security questionnaire|dpa|sso/i, outcome: 'Enterprise inquiry', sentiment: 'positive', score: 0.85, nextStep: 'Send proposal and schedule demo' },
  { match: /callback|call back|called back|ring me/i, outcome: 'Callback requested', sentiment: 'positive', score: 0.72, nextStep: 'Schedule callback' },
  { match: /webhooks? stopped|did not reach|missed a follow-up|not delivered/i, outcome: 'Support issue', sentiment: 'negative', score: 0.18, nextStep: 'Escalate to support' },
  { match: /not a fit|incumbent|went with|not interested/i, outcome: 'Not interested', sentiment: 'negative', score: 0.15, nextStep: 'Close out, no action' },
];

function scoreSentiment(transcript) {
  const text = transcript.toLowerCase();
  let score = 0.5;

  for (const term of POSITIVE) {
    if (text.includes(term)) score += 0.07;
  }
  for (const term of NEGATIVE) {
    if (text.includes(term)) score -= 0.12;
  }

  return Number(Math.min(0.97, Math.max(0.03, score)).toFixed(2));
}

function summarise(transcript, outcome) {
  const sentences = transcript
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 24);

  if (sentences.length === 0) {
    return outcome ? `${outcome}. No transcript detail available.` : 'No transcript detail available.';
  }

  // Keep the sentence that carries the most intent signal, then one supporting clause.
  const scored = sentences
    .map((s) => {
      const lower = s.toLowerCase();
      let weight = 0;
      for (const term of [...POSITIVE, ...NEGATIVE]) {
        if (lower.includes(term)) weight += 1;
      }
      if (/how does|what does|can you|do you support|what happens/.test(lower)) weight += 2;
      return { s, weight };
    })
    .sort((a, b) => b.weight - a.weight);

  const primary = scored[0].s;
  const secondary = scored.find((x) => x.s !== primary);

  let summary = primary.replace(/^(hi|hello|good morning|hey)[,.]?\s*/i, '').trim();
  if (summary.length > 140) summary = `${summary.slice(0, 137).trimEnd()}...`;
  if (secondary && summary.length < 90) {
    const tail = secondary.s.replace(/^(so|and|but)[,]?\s*/i, '').trim();
    if (tail.length < 90) summary = `${summary} ${tail}`;
  }
  return summary;
}

export function summariseCall({ transcript = '', outcome: providedOutcome = '' } = {}) {
  const text = transcript.trim();

  if (!text) {
    return {
      outcome: providedOutcome || 'Unknown',
      summary: 'No transcript was supplied for this call.',
      sentiment: 'neutral',
      sentimentScore: 0.5,
      nextStep: 'Review call manually',
    };
  }

  const rule = OUTCOME_RULES.find((r) => r.match.test(text));
  const score = scoreSentiment(text);
  const sentiment = score >= 0.62 ? 'positive' : score <= 0.4 ? 'negative' : 'neutral';

  return {
    outcome: rule?.outcome ?? providedOutcome ?? 'Call logged',
    summary: summarise(text, providedOutcome),
    sentiment: rule?.sentiment ?? sentiment,
    sentimentScore: rule?.score ?? score,
    nextStep: rule?.nextStep ?? 'Review summary and confirm next step',
  };
}

/** A stable fingerprint so identical calls produce identical results. */
export function callFingerprint(leadId, transcript) {
  return crypto.createHash('sha256').update(`${leadId}:${transcript}`).digest('hex').slice(0, 16);
}

export default summariseCall;
