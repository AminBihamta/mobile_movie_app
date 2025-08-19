import { useEffect, useRef, useState } from "react";

export default function useFetch<T>(fetchFunction: () => Promise<T>, autoFetch = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      if (mountedRef.current) setData(result);
    } catch (e: any) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : "Unknown error";
      if (mountedRef.current) setError(new Error(msg));
      console.log("useFetch error:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  const reset = () => {
    if (!mountedRef.current) return;
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (autoFetch) fetchData();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return { data, loading, error, refetch: fetchData, reset };
}