import { ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui';
import ctaImage from '../../../assets/cta-ridge.jpg';
import styles from '../Landing.module.css';

export default function CtaBanner() {
  return (
    <section className={styles.ctaBanner}>
      <img src={ctaImage} alt="" className={styles.ctaImage} />
      <div className={styles.ctaScrim} aria-hidden="true" />

      <div className={styles.ctaContent}>
        <h2 className={styles.ctaTitle}>Ready to meet your new call assistant?</h2>
        <p className={styles.ctaBody}>
          This is your assistant working inside your own stack. Log a call, and see the follow-up
          leave the building before the next one comes in.
        </p>
        <div className={styles.ctaActions}>
          <Button to="/signup" variant="primary" size="lg">
            Start free
            <ArrowRight size={16} aria-hidden="true" />
          </Button>
          <Button to="/docs" variant="secondary" size="lg">
            Read the docs
          </Button>
        </div>
      </div>
    </section>
  );
}
