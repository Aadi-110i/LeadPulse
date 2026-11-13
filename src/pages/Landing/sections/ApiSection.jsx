import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button, Chip, CopyButton, Tabs } from '../../../components/ui';
import { API_ENDPOINTS, curlFor } from '../../../data/apiDocs';
import styles from '../Landing.module.css';

const FEATURED = ['log-call', 'list-leads', 'update-lead', 'observability'];

const METHOD_TONE = {
  GET: 'positive',
  POST: 'accent',
  PATCH: 'caution',
  DELETE: 'negative',
};

export default function ApiSection() {
  const [activeId, setActiveId] = useState(FEATURED[0]);
  const endpoint = API_ENDPOINTS.find((item) => item.id === activeId) ?? API_ENDPOINTS[0];

  const requestBody = endpoint.body
    ? JSON.stringify(endpoint.body, null, 2)
    : endpoint.query
      ? null
      : '';

  const tabs = FEATURED.map((id) => {
    const item = API_ENDPOINTS.find((entry) => entry.id === id);
    return { id, label: item.title };
  });

  return (
    <section className={styles.section} id="api">
      <div className={styles.sectionHead}>
        <span className={styles.sectionLabel}>API</span>
        <h2 className={styles.sectionTitle}>A REST API that reads like it was written for you.</h2>
        <p className={styles.sectionBody}>
          Every endpoint is JSON in, JSON out, bearer-authenticated, and versioned under{' '}
          <code className={styles.inlineCode}>/api</code>.
        </p>
      </div>

      <div className={styles.apiPanel}>
        <Tabs items={tabs} value={activeId} onChange={setActiveId} ariaLabel="API endpoints" />

        <div className={styles.apiBody}>
          <div className={styles.apiMeta}>
            <Chip tone={METHOD_TONE[endpoint.method]}>{endpoint.method}</Chip>
            <code className={styles.apiPath}>{endpoint.path}</code>
          </div>
          <p className={styles.apiSummary}>{endpoint.summary}</p>

          <div className={styles.apiGrid}>
            {requestBody ? (
              <div className={styles.codeBlock}>
                <div className={styles.codeHead}>
                  <span className="micro">Request body</span>
                  <CopyButton value={requestBody} label="Copy" copiedLabel="Copied" />
                </div>
                <pre className={styles.code}>
                  <code>{requestBody}</code>
                </pre>
              </div>
            ) : null}

            <div className={styles.codeBlock}>
              <div className={styles.codeHead}>
                <span className="micro">Response &middot; {endpoint.response.status}</span>
                <CopyButton
                  value={JSON.stringify(endpoint.response.body, null, 2)}
                  label="Copy"
                  copiedLabel="Copied"
                />
              </div>
              <pre className={styles.code}>
                <code>{JSON.stringify(endpoint.response.body, null, 2)}</code>
              </pre>
            </div>
          </div>

          <div className={styles.codeBlock}>
            <div className={styles.codeHead}>
              <span className="micro">cURL</span>
              <CopyButton value={curlFor(endpoint)} label="Copy" copiedLabel="Copied" />
            </div>
            <pre className={styles.code}>
              <code>{curlFor(endpoint)}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className={styles.apiCta}>
        <Button to="/docs" variant="secondary">
          Full API reference
          <ArrowRight size={16} aria-hidden="true" />
        </Button>
      </div>
    </section>
  );
}
