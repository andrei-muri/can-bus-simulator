import { useState, useEffect } from "react";

const useFetch = (url) => {
  const [data, setData] = useState(null); // Holds the fetched data
  const [loading, setLoading] = useState(true); // Tracks loading state
  const [error, setError] = useState(null); // Tracks error state

  useEffect(() => {
    // Abort controller to handle cleanup on unmount
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      console.log(url);
      setLoading(true); // Start loading
      setError(null); // Reset error state

      try {
        const response = await fetch(url, { signal });
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const jsonData = await response.json();
        console.log(jsonData);
        setData(jsonData); // Set fetched data
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message); // Set error state if not an abort error
        }
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchData();

    // Cleanup function to abort fetch on component unmount
    return () => {
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
};

export default useFetch;
