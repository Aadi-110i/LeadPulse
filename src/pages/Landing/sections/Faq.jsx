import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import styles from '../Landing.module.css';

const QUESTIONS = [
  {
    id: 'integration',
    question: 'How much work is the integration?',
    answer:
      'One POST. You send a lead id, a duration and a transcript, and the summary, sentiment and follow-up job are all downstream of that single request.',
  },
  {
    id: 'channels',
    question: 'Which channels can it send on?',
    answer:
      'WhatsApp is the default outbound channel in this build. The delivery layer is isolated behind the queue, so another provider can be added without touching the API surface.',
  },
  {
    id: 'data',
    question: 'Where does my data live?',
    answer:
      'In your own Postgres instance. The service is designed to be self-hosted, and the dashboard reads the same tables the API writes.',
  },
  {
    id: 'retries',
    question: 'What happens if a message fails to send?',
    answer:
      'The job stays on the queue and retries with exponential backoff. After the retry budget is spent it lands in a dead-letter queue that the dashboard surfaces instead of swallowing.',
  },
  {
    id: 'transcripts',
    question: 'Do I have to send a transcript?',
    answer:
      'No. A duration and an outcome are enough to log the call. If you do send a transcript, you get the summary and sentiment on top of the record.',
  },
  {
    id: 'pricing',
    question: 'Is there a real pricing plan behind this page?',
    answer:
      'Not yet. The tiers shown here are illustrative placeholders for this build, and no plan is published or billed.',
  },
];

export default function Faq() {
  const [openId, setOpenId] = useState(QUESTIONS[0].id);

  return (
    <section className={styles.section} id="faq">
      <div className={styles.faqLayout}>
        <div className={styles.faqIntro}>
          <span className={styles.sectionLabel}>FAQ</span>
          <h2 className={styles.sectionTitle}>Questions answered, clearly delivered.</h2>
          <p className={styles.sectionBody}>
            If something here is still unclear, the API reference spells out every field and
            response body.
          </p>
        </div>

        <ul className={styles.faqList}>
          {QUESTIONS.map((item) => {
            const open = openId === item.id;
            return (
              <li key={item.id} className={styles.faqItem}>
                <button
                  type="button"
                  className={styles.faqQuestion}
                  aria-expanded={open}
                  onClick={() => setOpenId(open ? null : item.id)}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    size={16}
                    className={open ? styles.faqChevronOpen : styles.faqChevron}
                    aria-hidden="true"
                  />
                </button>
                <div className={styles.faqAnswer} hidden={!open}>
                  <p>{item.answer}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
