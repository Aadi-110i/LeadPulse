import { Quote } from 'lucide-react';
import styles from '../Landing.module.css';

const QUOTES = [
  {
    id: 'q1',
    text: 'We logged the call from our own dialer and the follow-up was out before I had finished writing the ticket. That was the week we stopped losing warm leads.',
    name: 'Priya Raman',
    role: 'RevOps lead',
    initials: 'PR',
  },
  {
    id: 'q2',
    text: 'The API is small enough that I read the whole reference in an afternoon. Four endpoints did everything our previous tool did with six.',
    name: 'Daniel Okafor',
    role: 'Founding engineer',
    initials: 'DO',
  },
  {
    id: 'q3',
    text: 'Summaries are short enough that a rep actually reads them. That was never true of the transcripts we used to get back from the vendor.',
    name: 'Marta Silva',
    role: 'Head of sales',
    initials: 'MS',
  },
  {
    id: 'q4',
    text: 'The dead-letter queue saved us during a provider outage. We saw the failures, replayed them, and nothing was lost quietly.',
    name: 'Arun Mehta',
    role: 'Platform engineer',
    initials: 'AM',
  },
];

export default function Testimonials() {
  return (
    <section className={styles.section} id="customers">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>Customers</span>
        <h2 className={styles.sectionTitle}>
          What teams say after they switch their follow-ups over.
        </h2>
      </div>

      <div className={styles.quoteGrid}>
        {QUOTES.map((quote) => (
          <figure key={quote.id} className={styles.quote}>
            <Quote size={16} className={styles.quoteMark} aria-hidden="true" />
            <blockquote className={styles.quoteText}>{quote.text}</blockquote>
            <figcaption className={styles.quoteMeta}>
              <span className={styles.quoteAvatar} aria-hidden="true">
                {quote.initials}
              </span>
              <span className={styles.quoteAuthor}>
                <span className={styles.quoteName}>{quote.name}</span>
                <span className={styles.quoteRole}>{quote.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>

      <p className={styles.illustrative}>
        Illustrative quotes written for this build. They illustrate the layout, not verified
        customer results.
      </p>
    </section>
  );
}
