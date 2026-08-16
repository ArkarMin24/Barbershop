import { useEffect, useState } from 'react';

export function useAdminData(fetcher, dependencies = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const result = await fetcher();
        if (!ignore) {
          setData(result || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Failed to load data');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, dependencies);

  return { data, loading, error };
}
