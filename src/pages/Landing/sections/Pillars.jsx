import cardCalls from '../../../assets/card-calls.jpg';
import cardNotes from '../../../assets/card-notes.jpg';
import cardPipeline from '../../../assets/card-pipeline.jpg';
import styles from '../Landing.module.css';

const PILLARS = [
  {
    id: 'capture',
    image: cardCalls,
    tag: 'Capture',
    title: 'Every call, on the record',
    body: 'Transcript, duration, sentiment and outcome attach to the lead itself instead of living in somebody’s notebook.',
  },
  {
    id: 'flow',
    image: cardPipeline,
    tag: 'Flow',
    title: 'A pipeline that moves itself',
    body: 'Statuses update from the events your own systems emit, so the board is never a spreadsheet somebody forgot to share.',
  },
  {
    id: 'reply',
    image: cardNotes,
    tag: 'Reply',
    title: 'The follow-up lands on time',
    body: 'The reply goes out on WhatsApp minutes after hangup, carrying the context of the conversation it came from.',
  },
];

export default function Pillars() {
  return (
    <section className={styles.section} id="pillars">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>One pipeline</span>
        <h2 className={styles.sectionTitle}>
          Every call arrives with context, a summary and a next step.
        </h2>
      </div>

      <div className={styles.pillarGrid}>
        {PILLARS.map((pillar) => (
          <article key={pillar.id} className={styles.pillar}>
            <div className={styles.pillarMedia}>
              <img src={pillar.image} alt="" className={styles.pillarImage} loading="lazy" />
              <span className={styles.pillarTag}>{pillar.tag}</span>
            </div>
            <h3 className={styles.pillarTitle}>{pillar.title}</h3>
            <p className={styles.pillarBody}>{pillar.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
