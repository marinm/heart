import { useCallback, useEffect, useRef, useState } from "react";

export function useBroadcastWebSocket() {
  const websocketRef = useRef<null | WebSocket>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [isOnline, setIsOnline] = useState<boolean>(window.navigator.onLine);
  const [error, setError] = useState<boolean>(false);
  const onMessageRef = useRef<(message: object) => void>(() => {});

  function reasonError(method: string, reason: string) {
    console.log(`ignoring ${method}() because ${reason}`);
  }

  const open = useCallback((url: string) => {
    if (websocketRef.current !== null) {
      reasonError("open", "already open");
      return;
    }
    websocketRef.current = new WebSocket(url);

    const websocket = websocketRef.current;

    websocket.onopen = () => {
      setReadyState(websocket.readyState);
      setError(false);
    };

    websocket.onmessage = (event) => {
      const message = safeJsonParse(event.data);
      if (message === null) {
        reasonError("onMessage", "incoming message is not valid JSON object");
        return;
      }
      onMessageRef.current(message);
    };

    websocket.onclose = () => {
      setReadyState(websocket.readyState);
      websocketRef.current = null;
    };

    websocket.onerror = (err) => {
      console.error(err);
      setError(true);
    };
  }, []);

  const send = useCallback((message: unknown) => {
    if (websocketRef.current === null) {
      reasonError("send", "closed");
      return;
    }
    if (websocketRef.current.readyState != WebSocket.OPEN) {
      reasonError("send", "closed");
      return;
    }
    const stringified = safeJsonStringify(message);
    if (stringified === null) {
      reasonError("send", "message cannot be stringified");
      return;
    }
    websocketRef.current.send(stringified);
  }, []);

  const close = useCallback(() => {
    if (websocketRef.current === null) {
      reasonError("close", "already closed");
      return;
    }

    if (
      websocketRef.current.readyState === WebSocket.CLOSING ||
      websocketRef.current.readyState === WebSocket.CLOSED
    ) {
      reasonError("close", "already closed");
      return;
    }

    if (websocketRef.current.readyState === WebSocket.CONNECTING) {
      reasonError("close", "connecting in progress");
      return;
    }

    if (websocketRef.current.readyState === WebSocket.OPEN) {
      websocketRef.current.close();
      return;
    }

    reasonError("close", "uncaught readyState");
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      close();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [close]);

  function onMessage(callback: (message: object) => void) {
    onMessageRef.current = callback;
  }

  return {
    isOnline,
    readyState,
    error,
    open,
    send,
    close,
    onMessage,
  };
}

function safeJsonStringify(value: unknown): string | null {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
}

function safeJsonParse(value: unknown): object | null {
  try {
    const parsed = JSON.parse(String(value));
    return typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
