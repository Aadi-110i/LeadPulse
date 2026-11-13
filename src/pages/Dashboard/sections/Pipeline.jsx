import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowDown, ArrowUp, Search } from 'lucide-react';
import { Chip, EmptyState, Select, TextInput } from '../../../components/ui';
import LeadDetail from '../components/LeadDetail';
import styles from '../Dashboard.module.css';

const SENTIMENT_TONE = { positive: 'positive', neutral: 'neutral', negative: 'negative' };
const STATUS_TONE = { new: 'neutral', contacted: 'accent', converted: 'positive', lost: 'negative' };

const COLUMNS = [
  { id: 'name', label: 'Lead', sortable: true },
  { id: 'company', label: 'Company', sortable: false },
  { id: 'status', label: 'Status', sortable: true },
  { id: 'sentiment', label: 'Sentiment', sortable: true },
  { id: 'nextStep', label: 'Next step', sortable: false },
  { id: 'updatedAt', label: 'Updated', sortable: true },
];

function relativeTime(value) {
  if (!value) return '—';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function Pipeline({ leads, stats, onRefresh }) {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [sortKey, setSortKey] = useState('updatedAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedId, setSelectedId] = useState(() => location.state?.leadId ?? null);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    const filtered = (leads ?? []).filter((lead) => {
      if (status !== 'all' && lead.status !== status) return false;
      if (!term) return true;
      return (
        lead.name.toLowerCase().includes(term) ||
        lead.company.toLowerCase().includes(term) ||
        lead.externalId.toLowerCase().includes(term) ||
        lead.aiSummary.toLowerCase().includes(term)
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      let left = a[sortKey];
      let right = b[sortKey];
      if (sortKey === 'sentiment') {
        left = a.sentimentScore;
        right = b.sentimentScore;
      }
      if (typeof left === 'string') {
        return sortDir === 'asc' ? left.localeCompare(right) : right.localeCompare(left);
      }
      return sortDir === 'asc' ? left - right : right - left;
    });
    return sorted;
  }, [leads, query, status, sortKey, sortDir]);

  function toggleSort(column) {
    if (sortKey === column) {
      setSortDir((current) => (current === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(column);
      setSortDir('asc');
    }
  }

  return (
    <div className={styles.pipeline}>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={15} aria-hidden="true" />
          <TextInput
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, company, id or summary"
            aria-label="Search leads"
          />
        </div>

        <Select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Filter by status"
          className={styles.toolbarSelect}
        >
          <option value="all">All stages</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
        </Select>

        <span className={styles.resultCount}>
          {rows.length} of {leads?.length ?? 0} leads
          {stats ? ` · ${stats.pipeline.converted} converted` : ''}
        </span>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.id} scope="col">
                  {column.sortable ? (
                    <button
                      type="button"
                      className={`${styles.sortButton} ${
                        sortKey === column.id ? styles['sortButton--active'] : ''
                      }`}
                      onClick={() => toggleSort(column.id)}
                    >
                      {column.label}
                      {sortKey === column.id ? (
                        sortDir === 'asc' ? (
                          <ArrowUp size={12} aria-hidden="true" />
                        ) : (
                          <ArrowDown size={12} aria-hidden="true" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr
                key={lead.id}
                className={selectedId === lead.id ? styles['row--selected'] : undefined}
                onClick={() => setSelectedId(lead.id)}
              >
                <td>
                  <span className={styles.cellName}>{lead.name}</span>
                  <span className={styles.cellId}>{lead.externalId}</span>
                </td>
                <td>{lead.company}</td>
                <td>
                  <Chip tone={STATUS_TONE[lead.status]}>{lead.status}</Chip>
                </td>
                <td>
                  <Chip tone={SENTIMENT_TONE[lead.sentiment]}>{lead.sentiment}</Chip>
                </td>
                <td className={styles.cellNext}>{lead.nextStep || '—'}</td>
                <td className={styles.cellTime}>{relativeTime(lead.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {rows.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No leads match that filter"
            body="Try a different stage, or clear the search box to see the whole pipeline."
          />
        ) : null}
      </div>

      {selectedId ? (
        <LeadDetail
          key={selectedId}
          leadId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={() => onRefresh?.()}
        />
      ) : null}
    </div>
  );
}
