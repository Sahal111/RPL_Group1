import { useState, useEffect } from "react";

/**
 * useDebounce — debounce value untuk mencegah request berlebihan saat search
 * @param {any} value - Value to debounce
 * @param {number} delay - Delay in ms (default: 400)
 * @returns debounced value
 */
export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
