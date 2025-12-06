import "./App.css";
import { useEffect, useCallback, useState } from "react";
import { useBroadcastWebSocket } from "./hooks/useBroadcastWebSocket";
import { useTimeoutState } from "./hooks/useTimeoutState";
import classNames from "classnames";
import { NumberOnline } from "./components/NumberOnline";
import z from "zod";
import { Heart } from "./components/Heart";

const ServerMessage = z.object({
  connection_id: z.string(),
  broadcast_at: z.string(),
  from: z.string(),
  data: z.object({
    present: z.array(z.string()).optional(),
    animation: z.string().optional(),
    timestamp: z.number().optional(),
  }),
});

type ServerMessage = z.infer<typeof ServerMessage>;

const animations = ["float-1", "float-2", "float-3", "float-4"];

function randomAnimation() {
  return animations[Math.floor(Math.random() * animations.length)];
}

function parseRawMessage(rawMessage: object): null | ServerMessage {
  try {
    return ServerMessage.parse(rawMessage);
  } catch (error) {
    console.error("Bad message", rawMessage);
    console.error(error);
    return null;
  }
}

function App() {
  const webSocket = useBroadcastWebSocket();
  const [tapped, setTappedWithTimeout] = useTimeoutState(false, 555);
  const [presentCount, setPresentCount] = useState(0);

  const channel =
    new URL(window.location.href).searchParams.get("channel") ?? "";
  const SERVER_URL = `http://localhost:3001/broadcast?channel=${channel}`;

  const onMessage = useCallback((rawMessage: object) => {
    const message = parseRawMessage(rawMessage);
    console.log(message);

    if (message === null) {
      return;
    }

    if (message.data.present) {
      setPresentCount(message.data.present.length);
    }

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
      <div onClick={tap}>
        <Heart
          className={classNames("big-heart", {
            grayscale: webSocket.readyState !== WebSocket.OPEN,
            tapped: tapped,
          })}
        />
      </div>
      <div className="stats-layer">
        <NumberOnline count={presentCount} />
      </div>
      <div className="small-hearts-layer"></div>
    </>
  );
}

export default App;
