import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  CircleCheck,
  CircleX,
  Loader,
  Play,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../auth/AuthProvider';
import { Button, Chip, CopyButton, Field, Note, TextInput } from '../../components/ui';
import { getAuthToken } from '../../api/client';
import api from '../../api/endpoints';
import { API_ENDPOINTS, API_GROUPS, curlFor } from '../../data/apiDocs';
import styles from './Docs.module.css';

const METHOD_TONE = {
  GET: 'positive',
  POST: 'accent',
  PATCH: 'caution',
  DELETE: 'negative',
};

const SAMPLE_LEAD_ID = '08e9b376-5673-42b3-ac60-71fa2e3997f7';

function resolvePath(path, leadId) {
  return path.replace('{lead_id}', leadId || SAMPLE_LEAD_ID);
}

function EndpointCard({ endpoint, leadId, onResult }) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const requestBody = endpoint.body ? JSON.stringify(endpoint.body, null, 2) : null;

  async function handleRun() {
    setRunning(true);
    setError('');
    setResult(null);

    const token = getAuthToken();
    const url = resolvePath(endpoint.path, leadId);

    try {
      const response = await fetch(url, {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
          ...(endpoint.auth && token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: requestBody ? requestBody : undefined,
      });

      const text = await response.text();
      let body = text;
      try {
        body = JSON.stringify(JSON.parse(text), null, 2);
      } catch {
        /* not JSON — keep the raw text */
      }

      setResult({ status: response.status, body });
      onResult?.({ endpoint: endpoint.id, status: response.status });
    } catch (err) {
      setError(err.message ?? 'The request could not be sent.');
      onResult?.({ endpoint: endpoint.id, status: 0, error: err.message });
    } finally {
      setRunning(false);
    }
  }

  return (
    <article className={styles.endpoint} id={endpoint.id}>
      <button
        type="button"
        className={styles.endpointHead}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Chip tone={METHOD_TONE[endpoint.method]}>{endpoint.method}</Chip>
        <code className={styles.endpointPath}>{endpoint.path}</code>
        <span className={styles.endpointTitle}>{endpoint.title}</span>
        <ChevronDown
          size={16}
          className={`${styles.chevron} ${open ? styles['chevron--open'] : ''}`}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <div className={styles.endpointBody}>
          <p className={styles.endpointSummary}>{endpoint.summary}</p>

          {endpoint.query ? (
            <div className={styles.queryTable}>
              <span className="micro">Query parameters</span>
              <ul>
                {endpoint.query.map((param) => (
                  <li key={param.name}>
                    <code>{param.name}</code>
                    <span className={styles.queryExample}>{param.value}</span>
                    <span className={styles.queryNote}>{param.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

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

          <div className={styles.codeBlock}>
            <div className={styles.codeHead}>
              <span className="micro">cURL</span>
              <CopyButton value={curlFor(endpoint)} label="Copy" copiedLabel="Copied" />
            </div>
            <pre className={styles.code}>
              <code>{curlFor(endpoint)}</code>
            </pre>
          </div>

          <div className={styles.runner}>
            <div className={styles.runnerHead}>
              <span className="micro">
                <Terminal size={13} aria-hidden="true" />
                Try it
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRun}
                disabled={running}
              >
                {running ? (
                  <Loader size={14} className={styles.spinnerIcon} aria-hidden="true" />
                ) : (
                  <Play size={14} aria-hidden="true" />
                )}
                {running ? 'Sending…' : 'Send request'}
              </Button>
            </div>

            {endpoint.auth ? (
              <p className={styles.runnerHint}>
                Sends your current session token as the <code>Authorization</code> header.
              </p>
            ) : null}

            {error ? (
              <Note tone="negative">{error}</Note>
            ) : null}

            {result ? (
              <div className={styles.runnerResult}>
                <span
                  className={`${styles.runnerStatus} ${
                    result.status >= 200 && result.status < 300
                      ? styles['runnerStatus--ok']
                      : styles['runnerStatus--bad']
                  }`}
                >
                  {result.status >= 200 && result.status < 300 ? (
                    <CircleCheck size={14} aria-hidden="true" />
                  ) : (
                    <CircleX size={14} aria-hidden="true" />
                  )}
                  {result.status || 'no response'}
                </span>
                <pre className={`${styles.code} ${styles['code--result']}`}>
                  <code>{result.body}</code>
                </pre>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export default function Docs() {
  const { isAuthenticated } = useAuth();
  const [leadId, setLeadId] = useState('');
  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState(API_ENDPOINTS[0].id);
  const [leadOptions, setLeadOptions] = useState([]);

  // Lead ids make the {lead_id} examples runnable against real records.
  useEffect(() => {
    if (!isAuthenticated) return;
    api
      .leads({ limit: 5 })
      .then((data) => {
        setLeadOptions(data);
        if (data[0]) setLeadId(data[0].id);
      })
      .catch(() => setLeadOptions([]));
  }, [isAuthenticated]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return API_ENDPOINTS;
    return API_ENDPOINTS.filter(
      (endpoint) =>
        endpoint.title.toLowerCase().includes(term) ||
        endpoint.path.toLowerCase().includes(term) ||
        endpoint.summary.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <div className={styles.page} data-surface="marketing">
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" />
          leadpulse.dev
        </Link>
        <span className={styles.headerDivider} aria-hidden="true" />
        <span className={styles.headerTitle}>API reference</span>
        <div className={styles.headerRight}>
          <Link to="/app" className={styles.headerLink}>
            Dashboard
          </Link>
          <Link to="/signin" className={styles.headerLink}>
            Sign in
          </Link>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSearch}>
            <TextInput
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filter endpoints"
              aria-label="Filter endpoints"
            />
          </div>

          {API_GROUPS.map((group) => {
            const items = filtered.filter((endpoint) => endpoint.group === group.id);
            if (items.length === 0) return null;
            return (
              <div key={group.id} className={styles.sidebarGroup}>
                <p className={styles.sidebarGroupLabel}>{group.label}</p>
                <ul>
                  {items.map((endpoint) => (
                    <li key={endpoint.id}>
                      <a
                        href={`#${endpoint.id}`}
                        className={`${styles.sidebarLink} ${
                          activeId === endpoint.id ? styles['sidebarLink--active'] : ''
                        }`}
                        onClick={() => setActiveId(endpoint.id)}
                      >
                        <span className={styles.sidebarMethod}>{endpoint.method}</span>
                        {endpoint.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </aside>

        <main className={styles.content}>
          <div className={styles.intro}>
            <h1 className={styles.title}>API reference</h1>
            <p className={styles.lede}>
              One base URL, JSON in and JSON out, bearer authentication on every private route.
              Expand an endpoint to see its request, its response and run it against the live
              server.
            </p>

            {isAuthenticated ? (
              <div className={styles.runnerConfig}>
                <Field label="Run against lead" htmlFor="lead-picker" hint="Used wherever the path contains {lead_id}.">
                  <select
                    id="lead-picker"
                    className={styles.select}
                    value={leadId}
                    onChange={(event) => setLeadId(event.target.value)}
                  >
                    {leadOptions.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} — {lead.externalId}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : (
              <Note tone="neutral">
                Sign in to run the protected endpoints with your own session token.{' '}
                <Link to="/signin" className={styles.noteLink}>
                  Sign in
                </Link>
              </Note>
            )}
          </div>

          <div className={styles.endpoints}>
            {filtered.map((endpoint) => (
              <EndpointCard key={endpoint.id} endpoint={endpoint} leadId={leadId} />
            ))}
          </div>

          <p className={styles.footnote}>
            All examples are generated from the running server&rsquo;s own schema and response
            shapes.
          </p>
        </main>
      </div>
    </div>
  );
}
