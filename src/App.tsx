import "./App.css";
import { useEffect, useCallback } from "react";
import { useBroadcastWebSocket } from "./hooks/useBroadcastWebSocket";
import { useTimeoutState } from "./hooks/useTimeoutState";
import classNames from "classnames";
import { NumberOnline } from "./components/NumberOnline";

type ServerMessage = {
  from: string;
  data: {
    timestamp: number;
    animation: string;
  };
};

const animations = ["float-1", "float-2", "float-3", "float-4"];

function randomAnimation() {
  return animations[Math.floor(Math.random() * animations.length)];
}

function parseRawMessage(rawMessage: unknown): null | ServerMessage {
  let message = null;
  try {
    message = JSON.parse(String(rawMessage));
  } catch {
    message = null;
  }

  if (
    message !== null &&
    typeof message === "object" &&
    "from" in message &&
    typeof message.from === "string" &&
    "data" in message &&
    typeof message.data === "object" &&
    "timestamp" in message.data &&
    typeof message.data.timestamp === "number" &&
    "animation" in message.data &&
    typeof message.data.animation === "string" &&
    animations.includes(message.data.animation)
  ) {
    return message;
  }

  return null;
}

function App() {
  const webSocket = useBroadcastWebSocket();
  const [tapped, setTappedWithTimeout] = useTimeoutState(false, 555);

  const channel =
    new URL(window.location.href).searchParams.get("channel") ?? "";
  const SERVER_URL = `http://localhost:3001/broadcast?channel=${channel}`;

  const onMessage = useCallback((rawMessage: unknown) => {
    const message = parseRawMessage(rawMessage);
    console.log(message);

    // const latency = Date.now() - message.data.timestamp;
    // newHeart(animationName, latency);
  }, []);

  useEffect(() => webSocket.onMessage(onMessage), [webSocket, onMessage]);

  useEffect(() => webSocket.open(SERVER_URL), [webSocket, SERVER_URL]);

  function tap() {
    setTappedWithTimeout(true);

    if (webSocket.readyState == WebSocket.CLOSED) {
      webSocket.open(SERVER_URL);
      return;
    }

    if (webSocket.readyState !== WebSocket.OPEN) {
      return;
    }

    webSocket.send({
      data: { timestamp: Date.now(), animation: randomAnimation() },
    });
  }

  return (
    <>
      <div>
        <svg
          id="big-heart"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className={classNames({
            grayscale: webSocket.readyState !== WebSocket.OPEN,
            tapped: tapped,
          })}
          onClick={tap}
        >
          {/* <!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--> */}
          <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z" />
        </svg>
      </div>
      <div className="stats-layer">
        <NumberOnline count={1} />
      </div>
      <div className="small-hearts-layer"></div>
    </>
  );
}

export default App;
