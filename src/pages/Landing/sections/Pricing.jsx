import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button, Chip } from '../../../components/ui';
import styles from '../Landing.module.css';

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    monthly: 29,
    annual: 24,
    tagline: 'Perfect for indie devs and small teams getting started.',
    features: [
      '2,000 logged calls per month',
      '3 seats',
      'Email support',
      '7-day call history',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    monthly: 79,
    annual: 64,
    tagline: 'For teams that live in the pipeline all day.',
    features: [
      '20,000 logged calls per month',
      '10 seats',
      'Priority support',
      '90-day call history',
      'Webhook delivery logs',
    ],
    highlight: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    monthly: 199,
    annual: 162,
    tagline: 'For businesses that need the whole lifecycle visible.',
    features: [
      'Unlimited logged calls',
      '25 seats',
      'Usage statistics',
      'Unlimited call history',
      'Dead-letter queue inspection',
    ],
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>Pricing</span>
        <h2 className={styles.sectionTitle}>Pay for the calls you actually take.</h2>
      </div>

      <div className={styles.pricingToggle}>
        <button
          type="button"
          className={styles.toggleOption}
          aria-pressed={!annual}
          onClick={() => setAnnual(false)}
        >
          Monthly
        </button>
        <button
          type="button"
          className={styles.toggleOption}
          aria-pressed={annual}
          onClick={() => setAnnual(true)}
        >
          Annual <span className={styles.toggleBadge}>save 18%</span>
        </button>
      </div>

      <div className={styles.pricingGrid}>
        {TIERS.map((tier) => {
          const price = annual ? tier.annual : tier.monthly;
          return (
            <article
              key={tier.id}
              className={`${styles.pricingCard} ${tier.highlight ? styles['pricingCard--highlight'] : ''}`}
            >
              {tier.highlight ? <Chip tone="accent">Most teams pick this</Chip> : null}

              <h3 className={styles.planName}>{tier.name}</h3>
              <p className={styles.planTagline}>{tier.tagline}</p>

              <p className={styles.planPrice}>
                <span className={styles.planAmount}>${price}</span>
                <span className={styles.planPeriod}>/ month</span>
              </p>
              <p className={styles.planNote}>
                {annual ? 'Billed annually' : 'Billed monthly'}
              </p>

              <ul className={styles.planFeatures}>
                {tier.features.map((feature) => (
                  <li key={feature}>
                    <Check size={15} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                to="/signup"
                variant={tier.highlight ? 'primary' : 'secondary'}
                full
              >
                Start with {tier.name}
              </Button>
            </article>
          );
        })}
      </div>

      <p className={styles.illustrative}>
        Illustrative pricing. These tiers are placeholders for this build &mdash; no plan is
        published or billed here, and no SLA or uptime commitment is implied.
      </p>
    </section>
  );
}
