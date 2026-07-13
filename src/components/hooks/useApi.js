import { useState, useCallback } from 'react';

/**
 * Custom hook for standardized API requests.
 * Integration: Use this for Newsfeed posts, Club data, and Election results.
 */
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (apiFunc, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setLoading(false);
      return response;
    } catch (err) {
      setLoading(false);
      setError(err.message || 'An unexpected error occurred');
      throw err;
    }
  }, []);

  return { request, loading, error };
};

export default useApi;