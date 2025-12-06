import { useRef, useState } from "react";

export function useTemporaryState<T>(
  initialState: T,
  timeout?: number,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initialState);
  const timeoutIdRef = useRef<null | number>(null);

  function setStateWithTimeout(value: T) {
    setState(value);
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => setState(initialState), timeout);
  }

  return [state, setStateWithTimeout];
}
