import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

/**
 * Custom hook for declarative data fetching with loading and error states
 *
 * @param {string} url - API endpoint to fetch
 * @param {object} [options] - Optional parameters
 * @param {boolean} [options.immediate=true] - Whether to fetch immediately on mount
 * @returns {{ data: any, loading: boolean, error: any, refetch: Function }}
 */
export function useFetch(url, { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async () => {
    if (!url) return;
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      execute().catch(() => {});
    }
  }, [execute, immediate]);

  return { data, loading, error, refetch: execute };
}

export default useFetch;
