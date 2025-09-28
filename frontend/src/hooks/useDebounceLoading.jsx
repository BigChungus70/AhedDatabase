import { useEffect, useRef, useState } from "react";

function useDebounceLoading(loading, delay = 300) {
  const [showLoading, setShowLoading] = useState(false);
  const timeoutRef = useRef(null);
  const isFirstLoad = useRef(true); // Track if this is the first load

  useEffect(() => {
    if (loading) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Show immediately on first load, delay on subsequent loads
      if (isFirstLoad.current) {
        setShowLoading(true);
        isFirstLoad.current = false; // Mark first load as complete
      } else {
        timeoutRef.current = setTimeout(() => {
          setShowLoading(true);
        }, delay);
      }
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setShowLoading(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loading, delay]);

  return showLoading;
}

export default useDebounceLoading;
