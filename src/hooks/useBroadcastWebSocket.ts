import { useCallback, useEffect, useRef, useState } from "react";

export function useBroadcastWebSocket() {
  const websocketRef = useRef<null | WebSocket>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [hasError, setHasError] = useState(false);
  const onMessageRef = useRef<(message: object) => void | null>(null);

  const onMessage = (callback: (message: object) => void) => {
    onMessageRef.current = callback;
  };

  const open = useCallback((url: string) => {
    if (websocketRef.current !== null) {
      console.error("Websocket already open");
      return;
    }

    const websocket = new WebSocket(url);

    websocketRef.current = websocket;

    websocket.onopen = () => {
      setReadyState(websocket.readyState);
      setHasError(false);
    };

    websocket.onmessage = (event) => {
      const message = safeJsonParse(event.data);
      if (message === null) {
        console.error("Incoming message is not a valid JSON object");
        return;
      }
      onMessageRef.current?.(message);
    };

    websocket.onclose = () => {
      setReadyState(websocket.readyState);
      websocketRef.current = null;
    };

    websocket.onerror = (err) => {
      console.error(err);
      setHasError(true);
    };
  }, []);

  const send = useCallback((message: unknown) => {
    if (websocketRef.current?.readyState != WebSocket.OPEN) {
      console.error("Cannot send because the connection is closed");
      return;
    }

    const stringified = safeJsonStringify(message);
    if (stringified === null) {
      console.error("Cannot send because message cannot be stringified");
      return;
    }
    websocketRef.current.send(stringified);
  }, []);

  const close = useCallback(() => {
    if (!websocketRef.current) {
      logError("close", "already closed"); // TODO: CHANGE
      return false;
    }

    if (canWebsocketBeClosed(websocketRef.current)) {
      websocketRef.current.close();
    }
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    return () => {
      close();
    };
  }, [close]);

  return {
    isOnline,
    readyState,
    error: hasError,
    open,
    send,
    close,
    onMessage,
  };
}

function logError(method: string, reason: string) {
  console.error(`ignoring ${method}() because ${reason}`);
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

function canWebsocketBeClosed(websocket: WebSocket): boolean {
  switch (websocket.readyState) {
    case WebSocket.CLOSING:
    case WebSocket.CLOSED: {
      logError("close", "already closed"); // TODO: CHANGE
      return false;
    }
    case WebSocket.CONNECTING: {
      logError("close", "connecting in progress"); // TODO: CHANGE
      return false;
    }
    case WebSocket.OPEN: {
      return true;
    }
    default: {
      logError("close", "uncaught readyState"); // TODO: CHANGE
      return false;
    }
  }
}
