
import { useCallback, useEffect, useState } from "react";
import { api } from "./client";

export default function useApi(path, { skip = false } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const result = await api.get(path);
      setData(result);

    } catch (err) {
      setError(err.message);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [path]);

  useEffect(() => {
    if (!skip) {
      load();
    }

    return () => {};
  }, [load, skip]);

  const refetch = useCallback(() => {
    return load(true);
  }, [load]);

  return {
    data,
    loading,
    refreshing,
    error,
    refetch,
  };
}
