import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../../../api/endpoints';

const REFRESH_MS = 15_000;

/**
 * Loads the dashboard data and keeps it fresh.
 * One polling loop feeds every panel so the numbers on screen always agree
 * with each other.
 */
export function useDashboardData() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [observability, setObservability] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSync, setLastSync] = useState(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const [statsData, activityData, observabilityData, leadsData] = await Promise.all([
        api.stats(),
        api.activity({ limit: 14 }),
        api.observability(),
        api.leads({ limit: 100, sortBy: 'updatedAt', sortDir: 'desc' }),
      ]);
      if (!mounted.current) return;
      setStats(statsData);
      setActivity(activityData);
      setObservability(observabilityData);
      setLeads(leadsData);
      setError('');
      setLastSync(new Date());
    } catch (err) {
      if (!mounted.current) return;
      setError(err.message ?? 'Could not reach the API.');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    // The first load runs in a microtask so the effect body never sets state directly.
    Promise.resolve().then(refresh);

    const timer = setInterval(refresh, REFRESH_MS);
    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, [refresh]);

  return { stats, activity, observability, leads, loading, error, lastSync, refresh };
}

export default useDashboardData;
