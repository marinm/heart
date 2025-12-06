import { useState, useRef, useCallback } from "react";

/**
 * Creates a set that also returns a setter that temporarily includes the
 * passed value until the provided timeout
 */
export function useTemporarySet<T>(
  timeout: number,
): [Set<T>, (value: T) => void] {
  const [values, setValues] = useState<Set<T>>(new Set());
  const timers = useRef<Map<T, number>>(new Map());

  const add = useCallback(
    (value: T) => {
      setValues((prev) => {
        const next = new Set(prev);
        next.add(value);
        return next;
      });

      // Clear existing timer for this value
      const old = timers.current.get(value);
      if (old) {
        clearTimeout(old);
      }

      // Set new expiration
      const timeoutId = window.setTimeout(() => {
        setValues((prev) => {
          const next = new Set(prev);
          next.delete(value);
          return next;
        });
        timers.current.delete(value);
      }, timeout);

      timers.current.set(value, timeoutId);
    },
    [timeout],
  );

  return [values, add];
}
