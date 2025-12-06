import "./App.css";
import { useEffect, useCallback, useState } from "react";
import { useBroadcastWebSocket } from "./hooks/useBroadcastWebSocket";
import { useTimeoutState } from "./hooks/useTimeoutState";
import classNames from "classnames";
import { NumberOnline } from "./components/NumberOnline";
import { Heart } from "./components/Heart";
import { ServerMessageSchema } from "./types/ServerMessage";
import type { ServerMessage } from "./types/ServerMessage";
import { useTimeoutSet } from "./hooks/useTimeoutSet";

const animations = ["float-1", "float-2", "float-3", "float-4"];

function randomAnimation() {
  return animations[Math.floor(Math.random() * animations.length)];
}

function parseRawMessage(rawMessage: object): null | ServerMessage {
  try {
    return ServerMessageSchema.parse(rawMessage);
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
  const [hearts, addHeart] = useTimeoutSet(1500);

  const channel =
    new URL(window.location.href).searchParams.get("channel") ?? "";
  const SERVER_URL = `http://localhost:3001/broadcast?channel=${channel}`;

  const onMessage = useCallback(
    (rawMessage: object) => {
      const message = parseRawMessage(rawMessage);
      console.log(message);

      if (message === null) {
        return;
      }

      if (message.data.present) {
        setPresentCount(message.data.present.length);
      } else {
        addHeart(message.message_id);
      }

      // const latency = Date.now() - message.data.timestamp;
      // newHeart(animationName, latency);
    },
    [addHeart],
  );

  useEffect(() => console.log("Hearts:", [...hearts]), [hearts]);

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
