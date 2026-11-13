import { pool } from './pool.js';
import bcrypt from 'bcryptjs';

/* Deterministic PRNG so every seed run produces the same demo dataset. */
function mulberry32(seed) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261106);
const pick = (list) => list[Math.floor(rand() * list.length)];
const between = (min, max) => min + Math.floor(rand() * (max - min + 1));

const FIRST = ['Rahul', 'Sarah', 'Mike', 'Priya', 'Arjun', 'Elena', 'Tom', 'Nadia', 'Diego', 'Chen', 'Aisha', 'Lucas', 'Mei', 'Omar', 'Sofia', 'Yusuf', 'Grace', 'Ivan', 'Leila', 'Marcus', 'Anika', 'Jonas', 'Fatima', 'Peter', 'Riya', 'Hana', 'Andrei', 'Nina', 'Kabir', 'Clara', 'Dmitri', 'Zoe', 'Omar', 'Ines', 'Tariq', 'Elsa'];
const LAST = ['Sharma', 'Chen', 'Johnson', 'Nair', 'Mehta', 'Rossi', 'Bennett', 'Haddad', 'Alvarez', 'Wei', 'Okafor', 'Moreau', 'Zhang', 'Hassan', 'Silva', 'Khan', 'Lindqvist', 'Petrov', 'Rahman', 'Whitaker', 'Iyer', 'Berg', 'Farooq', 'Novak', 'Kapoor', 'Sato', 'Volkov', 'Costa', 'Singh', 'Nilsson'];
const COMPANIES = ['Northwind Logistics', 'Blueharbor Studio', 'Quantia Labs', 'Meridian Health', 'Halcyon Retail', 'Ironwood Legal', 'Cobalt Financial', 'Verdant Farms', 'Lumen Media', 'Trellis Software', 'Juniper Education', 'Sable Hospitality', 'Orbit Freight', 'Keystone Energy', 'Pinewood Realty', 'Atlas Robotics', 'Wren & Co.', 'Solstice Fitness', 'Dovetail Design', 'Crescent Insurance'];

const OUTCOMES = [
  { outcome: 'Interested', sentiment: 'positive', score: [0.72, 0.95], summaries: ['Interested in bulk pricing.', 'Interested in premium plan. Needs follow-up on Tuesday.', 'Wants a demo of the WhatsApp follow-up flow.'] },
  { outcome: 'Enterprise inquiry', sentiment: 'positive', score: [0.78, 0.97], summaries: ['Evaluating the enterprise tier for a 40-seat rollout.', 'Asked about volume pricing and SSO before committing.', 'Requested a security questionnaire and DPA.'] },
  { outcome: 'Callback requested', sentiment: 'positive', score: [0.6, 0.85], summaries: ['Asked to be called back after 4pm on Thursday.', 'Callback requested for next week once their CFO is back.', 'Wants to loop in their operations lead.'] },
  { outcome: 'Pricing question', sentiment: 'neutral', score: [0.4, 0.6], summaries: ['Query about API limits. Re-contact after checking logs.', 'Asked how follow-up message volume is billed.', 'Wants to understand the difference between plans.'] },
  { outcome: 'Support issue', sentiment: 'negative', score: [0.1, 0.32], summaries: ['Follow-up message did not reach the lead. Needs manual send.', 'Reporting that webhooks stopped arriving on Friday.', 'Escalated — missed a follow-up on a warm lead.'] },
  { outcome: 'Not interested', sentiment: 'negative', score: [0.05, 0.28], summaries: ['Not a fit at the moment, no timeline.', 'Unhappy about the price for their call volume.', 'Went with an incumbent vendor.'] },
];

const TRANSCRIPT_OPENERS = [
  'Hi, thanks for taking my call about the call-tracking product.',
  'Hello, we spoke last week about automating our follow-ups.',
  'Good morning, I wanted to walk through what your platform does for a sales team.',
  'Hey, one of our reps mentioned you handle customer calls.',
];
const TRANSCRIPT_BODIES = [
  'We take around forty inbound calls a day and the follow-ups get forgotten constantly. How does the summarisation actually work?',
  'Our team lives in WhatsApp, so the messages need to land there. Do you support that directly or through an integration?',
  'We already have a CRM, so this would have to sit next to it rather than replace it. What does the API look like?',
  'What happens when a job fails? I need to know it does not silently drop a customer.',
];
const TRANSCRIPT_CLOSERS = [
  'That sounds workable. I will confirm with the team and come back to you.',
  'Send me the details and I will forward it to our operations lead.',
  'Can you send over the pricing for that? We are comparing three vendors.',
  'Let us do this. Send the contract over and we will start next week.',
];

function transcriptFor() {
  return [pick(TRANSCRIPT_OPENERS), pick(TRANSCRIPT_BODIES), pick(TRANSCRIPT_CLOSERS)].join(' ');
}

function nextStepFor(outcome) {
  if (outcome === 'Interested' || outcome === 'Enterprise inquiry') return 'Send proposal and schedule demo';
  if (outcome === 'Callback requested') return 'Schedule callback';
  if (outcome === 'Pricing question') return 'Send pricing sheet';
  if (outcome === 'Support issue') return 'Escalate to support';
  return 'Close out, no action';
}

const LEAD_COUNT = 64;
const MAX_CALLS_PER_LEAD = 4;

export async function seed({ verbose = true } = {}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query('TRUNCATE webhook_events, followup_jobs, calls, api_keys, leads, users RESTART IDENTITY CASCADE');

    const passwordHash = await bcrypt.hash('demo1234', 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ('demo@leadpulse.dev', $1, 'Demo Owner', 'owner')
       ON CONFLICT DO NOTHING`,
      [passwordHash]
    );

    const now = Date.now();
    const leadIds = [];
    let jobCounter = 0;

    for (let i = 0; i < LEAD_COUNT; i += 1) {
      const first = pick(FIRST);
      const last = pick(LAST);
      const name = `${first} ${last}`;
      const company = pick(COMPANIES);
      const createdAt = new Date(now - between(0, 29 * 24 * 60) * 60 * 1000);

      // Status distribution: new 30%, contacted 35%, converted 20%, lost 15%
      const roll = rand();
      let status = 'new';
      if (roll > 0.7) status = 'converted';
      else if (roll > 0.55) status = 'lost';
      else if (roll > 0.2) status = 'contacted';

      const profile = pick(OUTCOMES);
      const sentimentScore = Number((profile.score[0] + rand() * (profile.score[1] - profile.score[0])).toFixed(2));

      const leadRes = await client.query(
        `INSERT INTO leads
           (external_id, name, company, phone, email, status, ai_summary, sentiment, sentiment_score, followup_sent, next_step, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12)
         RETURNING id`,
        [
          `lead_${String(200 + i).padStart(3, '0')}`,
          name,
          company,
          `+1${between(200, 989)}${between(200, 999)}${between(1000, 9999)}`,
          `${first.toLowerCase()}.${last.toLowerCase()}@${company.toLowerCase().replace(/[^a-z]/g, '')}.com`,
          status,
          profile.summaries[0],
          profile.sentiment,
          sentimentScore,
          status === 'converted' || status === 'contacted' ? true : rand() > 0.6,
          nextStepFor(profile.outcome),
          createdAt,
        ]
      );
      const leadId = leadRes.rows[0].id;
      leadIds.push({ id: leadId, status, profile });

      const callCount = between(1, MAX_CALLS_PER_LEAD);
      let latestSummary = profile.summaries[0];
      let latestSentiment = profile.sentiment;
      let latestScore = sentimentScore;
      let latestOutcome = profile.outcome;

      for (let c = 0; c < callCount; c += 1) {
        const cp = pick(OUTCOMES);
        const score = Number((cp.score[0] + rand() * (cp.score[1] - cp.score[0])).toFixed(2));
        const summary = pick(cp.summaries);
        const callAt = new Date(createdAt.getTime() + c * between(3, 40) * 60 * 60 * 1000);
        if (callAt.getTime() > now) callAt.setTime(now - between(1, 240) * 60 * 1000);

        await client.query(
          `INSERT INTO calls
             (lead_id, duration_seconds, transcript, outcome, summary, sentiment, sentiment_score, next_step, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [
            leadId,
            between(45, 900),
            transcriptFor(),
            cp.outcome,
            summary,
            cp.sentiment,
            score,
            nextStepFor(cp.outcome),
            callAt,
          ]
        );
        latestSummary = summary;
        latestSentiment = cp.sentiment;
        latestScore = score;
        latestOutcome = cp.outcome;
      }

      // The lead row reflects the most recent call.
      await client.query(
        `UPDATE leads SET ai_summary = $2, sentiment = $3, sentiment_score = $4, next_step = $5 WHERE id = $1`,
        [leadId, latestSummary, latestSentiment, latestScore, nextStepFor(latestOutcome)]
      );

      // Follow-up jobs for this lead. The mix mirrors what the live queue
      // produces: most deliveries land on the first attempt, a slice needed the
      // retry, a couple dead-letter on a permanent opt-out, and a few are
      // still waiting.
      const jobCount = between(1, 3);
      for (let j = 0; j < jobCount; j += 1) {
        jobCounter += 1;
        // A fixed cadence rather than a random draw, so the failure mix is
        // exact and reproducible: 1 dead-letter per 47 jobs, 1 waiting per 53.
        const jobStatus = jobCounter % 47 === 0 ? 'dead_letter' : jobCounter % 53 === 0 ? 'queued' : 'sent';
        const retried = latestSentiment === 'negative' || rand() > 0.9;
        const attempts = jobStatus === 'dead_letter' ? 3 : jobStatus === 'queued' ? 0 : retried ? 2 : 1;
        const jobAt = new Date(now - between(0, 72) * 60 * 60 * 1000);
        // A retry only lands after the queue's backoff, so retried jobs are
        // measurably slower than first-attempt deliveries.
        const latency =
          jobStatus === 'dead_letter'
            ? between(2600, 5200)
            : retried
              ? between(1500, 3000)
              : between(80, 900);

        await client.query(
          `INSERT INTO followup_jobs
             (lead_id, channel, status, attempts, error, payload, created_at, completed_at)
           VALUES ($1,'whatsapp',$2,$3,$4,$5,$6,$7)`,
          [
            leadId,
            jobStatus,
            attempts,
            jobStatus === 'dead_letter' ? 'Recipient opted out of automated follow-ups.' : '',
            JSON.stringify({ to: `+1${between(200, 989)}${between(200, 999)}${between(1000, 9999)}`, template: 'follow_up' }),
            jobAt,
            jobStatus === 'queued' ? null : new Date(jobAt.getTime() + latency),
          ]
        );
      }
    }

    // Webhook delivery log.
    const EVENT_TYPES = ['call.logged', 'call.summarized', 'followup.sent', 'lead.status_changed'];
    for (let w = 0; w < 24; w += 1) {
      const ok = rand() > 0.15;
      await client.query(
        `INSERT INTO webhook_events (event_type, target_url, status, status_code, payload, created_at)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          pick(EVENT_TYPES),
          'https://hooks.example.com/leadpulse',
          ok ? 'delivered' : 'failed',
          ok ? 200 : 502,
          JSON.stringify({ event_id: `evt_${between(1000, 9999)}` }),
          new Date(now - between(0, 48) * 60 * 60 * 1000),
        ]
      );
    }

    await client.query('COMMIT');

    const counts = await pool.query(`
      SELECT
        (SELECT count(*) FROM leads)          AS leads,
        (SELECT count(*) FROM calls)          AS calls,
        (SELECT count(*) FROM followup_jobs)  AS jobs,
        (SELECT count(*) FROM webhook_events) AS events
    `);

    if (verbose) {
      console.log('[seed] demo dataset ready:', counts.rows[0]);
      console.log('[seed] demo login — demo@leadpulse.dev / demo1234');
    }

    return counts.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed()
    .then(() => pool.end())
    .catch((err) => {
      console.error('[seed] failed:', err.message);
      process.exit(1);
    });
}

export default seed;
