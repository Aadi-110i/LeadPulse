import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button, Chip } from '../../../components/ui';
import { API_ENDPOINTS, API_GROUPS } from '../../../data/apiDocs';
import styles from '../Landing.module.css';

const METHOD_TONE = {
  GET: 'positive',
  POST: 'accent',
  PATCH: 'caution',
  DELETE: 'negative',
};

export default function DocsPreview() {
  return (
    <section className={styles.section} id="docs">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>Documentation</span>
        <h2 className={styles.sectionTitle}>Everything the API can do, written down.</h2>
      </div>

      <div className={styles.docsLayout}>
        <nav className={styles.docsSidebar} aria-label="API reference sections">
          <p className={styles.docsSidebarTitle}>Reference</p>
          {API_GROUPS.map((group) => {
            const items = API_ENDPOINTS.filter((endpoint) => endpoint.group === group.id);
            return (
              <div key={group.id} className={styles.docsGroup}>
                <p className={styles.docsGroupLabel}>{group.label}</p>
                <ul>
                  {items.map((endpoint) => (
                    <li key={endpoint.id}>
                      <Link to={`/docs#${endpoint.id}`} className={styles.docsSidebarLink}>
                        <span className={styles.docsMethod}>{endpoint.method}</span>
                        {endpoint.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className={styles.docsCards}>
          {API_ENDPOINTS.slice(0, 4).map((endpoint) => (
            <article key={endpoint.id} className={styles.docCard}>
              <div className={styles.docCardHead}>
                <Chip tone={METHOD_TONE[endpoint.method]}>{endpoint.method}</Chip>
                <code className={styles.docPath}>{endpoint.path}</code>
              </div>
              <h3 className={styles.docCardTitle}>{endpoint.title}</h3>
              <p className={styles.docCardBody}>{endpoint.summary}</p>
            </article>
          ))}
        </div>
      </div>

      <div className={styles.docsCta}>
        <Button to="/docs" variant="secondary">
          <BookOpen size={16} aria-hidden="true" />
          Open the full reference
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
